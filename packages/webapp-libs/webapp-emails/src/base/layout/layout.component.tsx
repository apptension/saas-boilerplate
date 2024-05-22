import { Body, Container, Font, Head, Heading, Html, Section, Tailwind, Text } from '@react-email/components';
import { ENV } from '@sb/webapp-core/config/env';
import { fontFamily, fontWeight, size } from '@sb/webapp-core/theme';
import { ReactNode } from 'react';

import { Image } from '../image';

export type LayoutProps = {
  title: ReactNode;
  text: ReactNode;
  children?: ReactNode;
};

const localUrl = `http://localhost:3000/email-assets`;

export default function Layout({ title = 'title', text = 'text', children = 'children' }: LayoutProps) {
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
                customFont: [fontFamily.primary],
              },
            },
          },
        }}
      >
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container
            className={`border border-solid border-[#eaeaea] rounded mx-auto p-[20px] max-w-[548px] py-[${size.sizeUnits(5)}]`}
          >
            <Image src="logo.png" width={256} className="mt-0 mx-auto" />

            <Heading className="text-black text-[24px] text-center p-0 my-[30px] mx-0 font-customFont font-bold">
              {title}
            </Heading>

            <Text className="text-black text-[14px] leading-[24px] text-center font-customFont">{text}</Text>

            <Section className={`flex justify-center `}> {children}</Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
