import { Body, Container, Font, Head, Heading, Html, Section, Tailwind, Text } from '@react-email/components';
import { ENV } from '@sb/webapp-core/config/env';
import { fontFamily, fontWeight } from '@sb/webapp-core/theme';
import { ReactNode } from 'react';

import { Image } from '../image';

export type LayoutProps = {
  title: ReactNode;
  text: ReactNode;
  children?: ReactNode;
};

const localUrl = `http://localhost:3000/email-assets`;

export default function Layout({ title, text, children }: LayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily={fontFamily.primary}
          fallbackFontFamily="Verdana"
          webFont={{
            url: `${ENV.EMAIL_ASSETS_URL ?? localUrl}/Inter-Regular.woff`,
            format: 'woff',
          }}
          fontWeight={fontWeight.regular}
          fontStyle="normal"
        />

        <Font
          fontFamily={fontFamily.primary}
          fallbackFontFamily="Verdana"
          webFont={{
            url: `${ENV.EMAIL_ASSETS_URL ?? localUrl}/Inter-SemiBold.woff`,
            format: 'woff',
          }}
          fontWeight={fontWeight.bold}
          fontStyle="normal"
        />
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              fontFamily: {
                custom: [fontFamily.primary],
              },
            },
          },
        }}
      >
        <Body className="bg-white my-auto mx-auto font-sans p-8">
          <Container className="border border-solid border-[#eaeaea] rounded mx-auto max-w-[548px] p-10">
            <Image src="logo.png" width={256} className="mt-0 mx-auto" />

            <Heading className="text-black text-[24px] text-center p-0 my-[30px] mx-0 font-custom font-bold">
              {title}
            </Heading>

            <Text className="text-black text-[14px] leading-[24px] text-center font-custom">{text}</Text>

            <Section className="text-center">{children}</Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
