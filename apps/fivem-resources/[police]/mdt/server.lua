-- mdt/server.lua
-- Server-side: receives dispatch.requested events from ai_dispatch resource,
-- caches incidents for MDT queries, handles case note saves.

-- luacheck: globals exports TriggerClientEvent RegisterNetEvent AddEventHandler
-- luacheck: globals source GetPlayers json math table string os QBX GetConvar
-- luacheck: globals GetCurrentResourceName GetResourceKvpString SetResourceKvp

local MAX_INCIDENTS = 50   -- rolling window
local incidents     = {}   -- array of incident objects, newest first

local ALLOWED_SEVERITY = {
  petty = true, minor = true, major = true, serious = true, capital = true,
}

local NOTES_KVP_KEY = 'mdt:notes:v1'

--- Persist the (incidentId -> note) map to FiveM KVP so notes survive a
--- resource/server restart. Volatile incident list still rebuilds from new
--- dispatch.requested events, but operator notes don't vanish on reload.
local function persistNotes()
  local map = {}
  for _, inc in ipairs(incidents) do
    if inc.notes and inc.notes ~= '' then
      map[inc.incidentId] = inc.notes
    end
  end
  SetResourceKvp(NOTES_KVP_KEY, json.encode(map))
end

--- Restore notes from KVP after resource start.
local function restoreNotes()
  local raw = GetResourceKvpString(NOTES_KVP_KEY)
  if not raw then return {} end
  local ok, decoded = pcall(json.decode, raw)
  if not ok or type(decoded) ~= 'table' then return {} end
  return decoded
end

local restoredNotes = restoreNotes()

--- Reject anything but plain ASCII-ish strings of bounded length so a malicious
--- payload can't inject control characters / HTML into the NUI on the client.
local function safeString(value, maxLen)
  if type(value) ~= 'string' then return nil end
  if #value > (maxLen or 200) then return nil end
  if value:find('[<>]') then return nil end
  return value
end

-- Receive dispatched incidents forwarded from ai_dispatch (server-side only).
-- `mdt:newIncident` is a NetEvent purely so cross-resource TriggerEvent works
-- — but `source == 0` ONLY when fired server-side, so we reject anything else
-- to stop a modified client from injecting fake incidents.
RegisterNetEvent('mdt:newIncident', function(payload)
  if source ~= 0 then
    print(('[mdt] rejected mdt:newIncident from client source=%d'):format(source))
    return
  end
  if type(payload) ~= 'table' then return end

  local incidentId = safeString(payload.incidentId, 64)
  if not incidentId then return end

  local severity = payload.severity
  if not ALLOWED_SEVERITY[severity] then severity = 'minor' end

  -- ai_dispatch forwards `evt.data` from dispatch.requested which keeps
  -- location nested. Older internal callers may pass flattened fields.
  local loc = (type(payload.location) == 'table') and payload.location or payload
  local area     = safeString(loc.area, 64)     or 'unknown'
  local province = safeString(loc.province, 8)  or 'GP'
  local summary  = safeString(payload.summary, 1000) or ''
  local voiceUrl = safeString(payload.voiceUrl, 500)

  -- Prepend — newest first
  table.insert(incidents, 1, {
    incidentId = incidentId,
    severity   = severity,
    area       = area,
    province   = province,
    summary    = summary,
    voiceUrl   = voiceUrl,
    timestamp  = os.date('!%Y-%m-%dT%H:%M:%SZ'),
    notes      = restoredNotes[incidentId] or '',
  })

  -- Trim to max window
  while #incidents > MAX_INCIDENTS do
    table.remove(incidents)
  end
end)

-- Client requests the incident list (police-job check enforced client-side too)
RegisterNetEvent('mdt:requestIncidents', function()
  local playerId = source
  TriggerClientEvent('mdt:incidentList', playerId, incidents)
end)

-- Client saves a case note for an incident
RegisterNetEvent('mdt:saveNote', function(incidentId, note)
  local playerId = source
  if type(incidentId) ~= 'string' or type(note) ~= 'string' then return end
  if #note > 1000 then
    TriggerClientEvent('ox_lib:notify', playerId, {
      type = 'error', description = 'Note too long (max 1000 chars)',
    })
    return
  end

  for _, inc in ipairs(incidents) do
    if inc.incidentId == incidentId then
      inc.notes = note
      persistNotes()
      TriggerClientEvent('mdt:noteSaved', playerId, incidentId)
      return
    end
  end
end)
