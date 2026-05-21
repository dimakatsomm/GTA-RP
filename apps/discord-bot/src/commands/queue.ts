import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

/** Helper — returns true when the caller has a Moderator or Admin role. */
function isMod(interaction: ChatInputCommandInteraction): boolean {
  const member = interaction.member;
  if (!member || !('roles' in member)) return false;
  const roles = member.roles;
  // roles can be a Collection or a string array in the API types
  if (typeof roles === 'string') return false;
  if (Array.isArray(roles)) {
    // rare raw string-array path — not used in practice but satisfies types
    return false;
  }
  // GuildMemberRoleManager (Collection-like)
  return roles.cache.some((r) => r.name === 'Moderator' || r.name === 'Admin');
}

export const queueCommand = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Queue management commands.')
  .addSubcommand((sub) =>
    sub.setName('position').setDescription('Check your current position in the queue.'),
  )
  .addSubcommand((sub) =>
    sub.setName('clear').setDescription('(Mod only) Clear the entire queue.'),
  );

export async function queueHandler(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === 'position') {
    const position = Math.floor(Math.random() * 20) + 1;
    await interaction.reply({
      content: `Queue position: #${position} — queue system coming soon`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'clear') {
    if (!isMod(interaction)) {
      await interaction.reply({
        content: "You don't have permission.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.reply({ content: 'Queue cleared.' });
  }
}
