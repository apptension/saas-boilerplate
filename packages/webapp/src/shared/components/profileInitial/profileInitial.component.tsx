import { CurrentUserType } from '../../services/graphqlApi/__generated/types';

export type ProfileInitialProps = {
  profile?: CurrentUserType | null;
};

export const formatProfileInitial = (profile?: CurrentUserType | null) => profile?.firstName?.[0]?.toUpperCase() ?? 'U';

export const ProfileInitial = ({ profile }: ProfileInitialProps) => {
  return <>{formatProfileInitial(profile)}</>;
};
