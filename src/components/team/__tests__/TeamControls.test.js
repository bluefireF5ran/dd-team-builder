import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamControls from '../TeamControls';
import { EMPTY_HERO } from '../../../constants';

/**
 * Los caminos destructivos de la barra de controles: Clear, Backup y Restore.
 *
 * Son los que borran o sobrescriben algo, y ninguno tenia test. Lo que se fija
 * es la parte que se rompe en silencio: que Clear pregunte antes, que cancelar
 * no toque nada, que Backup no se ofrezca sin nada que respaldar, y que Restore
 * diga el resultado -- tambien cuando falla.
 */

const setup = (props = {}) => {
  const handlers = {
    onSave: jest.fn(),
    onLoad: jest.fn(),
    onToggleSetting: jest.fn(),
    onClearTeam: jest.fn(),
    onBackupAll: jest.fn(),
    onImportBackup: jest.fn(),
    showToast: jest.fn(),
  };
  render(
    <TeamControls
      heroes={Array.from({ length: 4 }, () => ({ ...EMPTY_HERO }))}
      teamName="Test Team"
      location="The Ruins"
      settings={{ theme: 'default', showModdedHeroes: false, showBackerTrinkets: false }}
      savedTeamsCount={0}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers, ...props };
};

describe('Clear', () => {
  it('asks before clearing, and cancelling leaves the team alone', () => {
    const { onClearTeam } = setup();
    fireEvent.click(screen.getByTitle('Clear entire team'));

    expect(screen.getByRole('dialog')).toHaveTextContent(/Reset all hero slots to empty/);
    expect(onClearTeam).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onClearTeam).not.toHaveBeenCalled();
  });

  it('clears only once confirmed, and says so', () => {
    const { onClearTeam, showToast } = setup();
    fireEvent.click(screen.getByTitle('Clear entire team'));
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));

    expect(onClearTeam).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith('Team cleared.', 'success');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Backup', () => {
  it('is not offered when there is nothing saved to back up', () => {
    setup({ savedTeamsCount: 0 });
    expect(screen.queryByTitle('Backup all saved teams to file')).not.toBeInTheDocument();
  });

  it('exports every saved team when there are some', () => {
    const { onBackupAll, showToast } = setup({ savedTeamsCount: 3 });
    fireEvent.click(screen.getByTitle('Backup all saved teams to file'));
    expect(onBackupAll).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith('All teams exported to file!', 'success');
  });
});

describe('Restore', () => {
  const backupFile = () => new File(['{}'], 'backup.json', { type: 'application/json' });

  it('imports the chosen file and reports what it imported and skipped', async () => {
    const onImportBackup = jest.fn().mockResolvedValue({ imported: 2, skipped: 1 });
    const { showToast } = setup({ onImportBackup });
    const file = backupFile();

    fireEvent.change(screen.getByLabelText(/Restore/), { target: { files: [file] } });

    expect(onImportBackup).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith('Imported 2 team(s), skipped 1 duplicate(s).', 'success')
    );
  });

  it('reports the error instead of failing silently', async () => {
    const onImportBackup = jest.fn().mockRejectedValue(new Error('Not a backup file.'));
    const { showToast } = setup({ onImportBackup });

    fireEvent.change(screen.getByLabelText(/Restore/), { target: { files: [backupFile()] } });

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Not a backup file.', 'error'));
  });

  it('does nothing when the picker is closed without a file', () => {
    const { onImportBackup } = setup();
    fireEvent.change(screen.getByLabelText(/Restore/), { target: { files: [] } });
    expect(onImportBackup).not.toHaveBeenCalled();
  });
});
