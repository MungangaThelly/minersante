import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="text-center">
      <label className="mr-2">{t('language')}:</label>
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
        className="border rounded p-1"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ln">Lingala</option>
        <option value="sw">Swahili</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;