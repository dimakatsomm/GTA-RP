-- mdt/server.lua
-- Server-side: receives dispatch.requested events from ai_dispatch resource,
-- caches incidents for MDT queries, handles case note saves.

-- luacheck: globals exports TriggerClientEvent RegisterNetEvent AddEventHandler
-- luacheck: globals source GetPlayers json math table string os QBX GetConvar

local MAX_INCIDENTS = 50   -- rolling window
local incidents     = {}   -- array of incident objects, newest first

-- Receive dispatched incidents forwarded from ai_dispatch resource
RegisterNetEvent('mdt:newIncident', function(payload)
  -- Only ai_dispatch (server-side) should fire this; validate shape
  if type(payload) ~= 'table'         then return end
  if type(payload.incidentId) ~= 'string' then return end

  -- Prepend — newest first
  table.insert(incidents, 1, {
    incidentId = payload.incidentId,
    severity   = payload.severity   or 'minor',
    area       = payload.area       or 'unknown',
    province   = payload.province   or 'GP',
    summary    = payload.summary    or '',
    voiceUrl   = payload.voiceUrl,
    timestamp  = os.date('!%Y-%m-%dT%H:%M:%SZ'),
    notes      = '',
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
      TriggerClientEvent('mdt:noteSaved', playerId, incidentId)
      return
    end
  end
end)
