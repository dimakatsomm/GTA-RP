import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

/** Helper — returns true when the caller has a Moderator or Admin role. */
function isMod(interaction: ChatInputCommandInteraction): boolean {
  const member = interaction.member;
  if (!member || !('roles' in member)) return false;
  const roles = member.roles;
  if (typeof roles === 'string') return false;
  if (Array.isArray(roles)) return false;
  return roles.cache.some((r) => r.name === 'Moderator' || r.name === 'Admin');
}

/** Post a line to the mod-log channel (best-effort; errors are logged, not thrown). */
async function postModLog(
  interaction: ChatInputCommandInteraction,
  action: 'KICK' | 'BAN',
  target: string,
  reason: string,
): Promise<void> {
  const channelId = process.env['DISCORD_MOD_LOG_CHANNEL_ID'] ?? '';
  if (!channelId) {
    console.warn('[mod] DISCORD_MOD_LOG_CHANNEL_ID not set — skipping log post');
    return;
  }
  try {
    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.warn(`[mod] Channel ${channelId} not found or not text-based`);
      return;
    }
    const mod = interaction.user.tag;
    await channel.send(
      `[${action}] Moderator: **${mod}** | Target: **${target}** | Reason: ${reason}`,
    );
  } catch (err) {
    console.error('[mod] Failed to post to mod-log channel:', err);
  }
}

export const modCommand = new SlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderator action commands.')
  .addSubcommand((sub) =>
    sub
      .setName('kick')
      .setDescription('(Mod only) Log a kick action against a player.')
      .addStringOption((opt) =>
        opt.setName('target').setDescription('Player name to kick.').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('reason').setDescription('Reason for the kick.').setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('ban')
      .setDescription('(Mod only) Log a ban action against a player.')
      .addStringOption((opt) =>
        opt.setName('target').setDescription('Player name to ban.').setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName('reason').setDescription('Reason for the ban.').setRequired(true),
      ),
  );

export async function modHandler(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!isMod(interaction)) {
    await interaction.reply({
      content: 'Permission denied.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const sub = interaction.options.getSubcommand() as 'kick' | 'ban';
  const target = interaction.options.getString('target', true);
  const reason = interaction.options.getString('reason', true);

  await postModLog(interaction, sub === 'kick' ? 'KICK' : 'BAN', target, reason);

  const label = sub === 'kick' ? 'Kick' : 'Ban';
  await interaction.reply({
    content: `${label} logged.`,
    flags: MessageFlags.Ephemeral,
  });
}
