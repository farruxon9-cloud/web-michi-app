import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MichiTextInputField({
  status,
  drawerInput,
  setDrawerInput
}) {
  const { t } = useTranslation();

  return (
    <input 
      type="text" 
      placeholder={
        status === 'listening' 
          ? t('listeningPlaceholder') 
          : status === 'thinking'
            ? '応答を生成中...'
            : t('askInputPlaceholder')
      }
      value={drawerInput}
      onChange={(e) => setDrawerInput(e.target.value)}
      disabled={status === 'thinking'}
      className="voice-drawer-input"
    />
  );
}
