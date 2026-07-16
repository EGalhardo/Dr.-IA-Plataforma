import { memo, useContext } from 'react';
import { TranslationContext } from '../../context/TranslationContext';

interface TranslatableTextProps {
  key: string;
  children: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'button' | 'label' | 'option' | 'div' | 'li' | 'td' | 'th';
  className?: string;
  title?: string;
  placeholder?: string;
}

const TranslatableText = memo(function TranslatableText({ 
  key: translationKey, 
  children, 
  as: Tag = 'span', 
  className,
  title,
  placeholder
}: TranslatableTextProps) {
  const { currentLang, getTranslation } = useContext(TranslationContext);
  
  const translatedText = currentLang !== 'pt' 
    ? getTranslation(translationKey, children) 
    : children;
  
  const translatedTitle = title && currentLang !== 'pt' 
    ? getTranslation(title, title) 
    : title;
  
  const translatedPlaceholder = placeholder && currentLang !== 'pt' 
    ? getTranslation(placeholder, placeholder) 
    : placeholder;

  return (
    <Tag 
      data-i18n-key={translationKey} 
      className={className}
      title={translatedTitle}
      placeholder={translatedPlaceholder}
    >
      {translatedText}
    </Tag>
  );
});

TranslatableText.displayName = 'TranslatableText';

export { TranslatableText };