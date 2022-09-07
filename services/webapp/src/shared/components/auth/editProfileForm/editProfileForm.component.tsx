import { FormattedMessage, useIntl } from 'react-intl';
import { Input } from '../../forms/input';
import { Container, ErrorMessage, Form, FormFieldsRow, SubmitButton } from './editProfileForm.styles';
import { FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH } from './editProfileForm.constants';
import { useEditProfileForm } from './editProfileForm.hooks';

export const EditProfileForm = () => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
    },
    genericError,
    hasGenericErrorOnly,
    handleUpdate,
  } = useEditProfileForm();

  return (
    <Container>
      <Form onSubmit={handleUpdate}>
        <FormFieldsRow>
          <Input
            {...register('firstName', {
              maxLength: {
                value: FIRST_NAME_MAX_LENGTH,
                message: intl.formatMessage({
                  defaultMessage: 'First name is too long',
                  id: 'Auth / Update profile/ First name max length error',
                }),
              },
            })}
            label={intl.formatMessage({
              defaultMessage: 'First name',
              id: 'Auth / Update profile / First name label',
            })}
            error={errors.firstName?.message}
          />
        </FormFieldsRow>

        <FormFieldsRow>
          <Input
            {...register('lastName', {
              maxLength: {
                value: LAST_NAME_MAX_LENGTH,
                message: intl.formatMessage({
                  defaultMessage: 'Last name is too long',
                  id: 'Auth / Update profile/ Last name max length error',
                }),
              },
            })}
            label={intl.formatMessage({
              defaultMessage: 'Last name',
              id: 'Auth / Update profile / Last name label',
            })}
            error={errors.lastName?.message}
          />
        </FormFieldsRow>

        {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
        <SubmitButton>
          <FormattedMessage defaultMessage="Update personal data" id="Auth / Update profile/ Submit button" />
        </SubmitButton>
      </Form>
    </Container>
  );
};
