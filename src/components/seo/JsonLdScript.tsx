import Script from 'next/script';

interface JsonLdScriptProps {
  jsonLd: string;
  id: string;
}

/**
 * Component để thêm JSON-LD vào trang
 */
export default function JsonLdScript({ jsonLd, id }: JsonLdScriptProps) {
  return <Script id={id} type='application/ld+json' dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
