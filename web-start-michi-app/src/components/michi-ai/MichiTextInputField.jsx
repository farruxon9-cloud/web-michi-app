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
          : t('askInputPlaceholder')
      }
      value={drawerInput}
      onChange={(e) => setDrawerInput(e.target.value)}
      className="voice-drawer-input"
    />
  );
}
