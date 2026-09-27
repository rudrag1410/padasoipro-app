import { zodResolver } from '@hookform/resolvers/zod';
import { PHONE_RULES, profileSchema, type ProfileDto, type ProfileInput } from '@padosipro/shared';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';
import { BrandHeader } from '@/components/brand';
import { InlineAlert } from '@/components/feedback';
import { FormTextField } from '@/components/forms';
import { Button, Screen, ScreenHeader } from '@/components/ui';
import { applyFieldErrors, getErrorMessage } from '@/helpers';
import { useAuth, useSaveProfile } from '@/hooks';
import { spacing } from '@/theme';

const FIELDS = ['name', 'mobile', 'address', 'businessName'] as const;

/** Shown once, right after the first login, until the profile is saved. */
export function ProfileScreen() {
  const { signOut } = useAuth();
  const saveProfile = useSaveProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const mobileRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const businessRef = useRef<TextInput>(null);

  const { control, handleSubmit, setError } = useForm<ProfileInput, unknown, ProfileDto>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', mobile: '', address: '', businessName: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await saveProfile.mutateAsync(values);
      // profileCompleted flips and the router guard moves on to task selection.
    } catch (error) {
      if (!applyFieldErrors(error, setError, FIELDS)) setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen
      header={<ScreenHeader right={<Button title="Log out" variant="ghost" compact onPress={signOut} />} />}
      footer={<Button title="Save and continue" onPress={onSubmit} loading={saveProfile.isPending} />}
    >
      <BrandHeader
        showLogo={false}
        title="Tell us about you"
        subtitle="Your Lifestyle Manager uses these details to reach you and plan visits."
      />

      <View style={styles.form}>
        {formError && <InlineAlert message={formError} />}
        <FormTextField
          control={control}
          name="name"
          label="Full name"
          icon="user"
          placeholder="e.g. Asha Verma"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => mobileRef.current?.focus()}
        />
        <FormTextField
          ref={mobileRef}
          control={control}
          name="mobile"
          label="Mobile number"
          icon="phone"
          prefix={PHONE_RULES.COUNTRY_CODE}
          placeholder="98765 43210"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={16}
          returnKeyType="next"
          onSubmitEditing={() => addressRef.current?.focus()}
        />
        <FormTextField
          ref={addressRef}
          control={control}
          name="address"
          label="Address"
          icon="map-pin"
          placeholder="Flat, building, street, area, city, PIN"
          multiline
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />
        <FormTextField
          ref={businessRef}
          control={control}
          name="businessName"
          label="Business name"
          optional
          icon="briefcase"
          placeholder="Only if you need help for a business"
          autoCapitalize="words"
          autoComplete="organization"
          textContentType="organizationName"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
});
