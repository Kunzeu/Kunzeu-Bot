// Importar la colección `cooldowns` desde el cliente
const { cooldowns } = client;

// Verificar si el comando tiene un cooldown configurado, si no, establecerlo
if (!cooldowns.has(command.data.name)) {
  cooldowns.set(command.data.name, new Collection());
}

// Obtener el tiempo actual
const now = Date.now();
const timestamps = cooldowns.get(command.data.name);
const defaultCooldownDuration = 3; // Cooldown predeterminado en segundos (puedes cambiarlo según tus necesidades)
const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000; // Convertir el cooldown a milisegundos

// Verificar si el usuario está en cooldown para el comando
if (timestamps.has(interaction.user.id)) {
  const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

  if (now < expirationTime) {
    const remainingTime = (expirationTime - now) / 1000; // Convertir el tiempo restante a segundos
    return interaction.reply({
      content: `Por favor, espera, estás en cooldown para \`${command.data.name}\`. Puedes usarlo nuevamente en ${remainingTime.toFixed(1)} segundos.`,
      ephemeral: true,
    });
  }
}

// Establecer el timestamp del usuario para el comando
timestamps.set(interaction.user.id, now);
setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

try {
  // Ejecutar el comando
  await command.execute(interaction);
} catch (error) {
  console.error(error);
  await interaction.reply({
    content: 'Hubo un error al ejecutar este comando.',
    ephemeral: true,
  });
}
