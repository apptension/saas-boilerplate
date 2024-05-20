const IconMock = () => {
  return <span />;
};

jest.mock('@iconify-icons/ion/pencil-sharp', () => IconMock);
jest.mock('@iconify-icons/ion/close-outline', () => IconMock);
jest.mock('@iconify-icons/ion/trash-outline', () => IconMock);
jest.mock('@iconify-icons/ion/star', () => IconMock);
jest.mock('@iconify-icons/ion/document-text-outline', () => IconMock);
jest.mock('@iconify-icons/ion/star-outline', () => IconMock);
jest.mock('@iconify-icons/ion/camera-outline', () => IconMock);
jest.mock('@iconify-icons/ion/alert-circle-outline', () => IconMock);
jest.mock('@iconify-icons/ion/mail-outline', () => IconMock);
jest.mock('@iconify-icons/ion/mail-unread-outline', () => IconMock);
jest.mock('@iconify-icons/ion/mail-open-outline', () => IconMock);
jest.mock('@iconify-icons/ion/pencil-outline', () => IconMock);
jest.mock('@iconify-icons/ion/trash-outline', () => IconMock);
jest.mock('@iconify-icons/ion/checkmark', () => IconMock);
jest.mock('@iconify-icons/ion/remove-outline', () => IconMock);
jest.mock('@iconify-icons/ion/chevron-back', () => IconMock);
