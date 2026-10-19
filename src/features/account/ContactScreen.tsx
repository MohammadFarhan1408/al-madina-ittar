/**
 * ContactScreen — contact channels and a validated message form (`POST /contact`).
 *
 * Call and email open the phone's dialer / mail app (device links, no backend); the
 * boutique and hours are informational. The form keeps its validation and endpoint.
 */
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout';
import { Button, FormField, ListGroup, MenuRow, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useSendContact } from '@/hooks/queries';
import { toast } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { contactSchema, type ContactValues } from './schemas';

const PHONE = '+971 4 000 0000';
const EMAIL = 'concierge@almadina.com';

export function ContactScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const icon = (Ic: typeof Phone) => <Ic size={18} color={colors.text.secondary} strokeWidth={1.5} />;
  const external = <ArrowUpRight size={16} color={colors.text.muted} strokeWidth={1.5} />;

  const open = (url: string) =>
    Linking.openURL(url).catch(() => toast.error("Couldn't open that on this device."));

  const sendContact = useSendContact();
  const onSubmit = (values: ContactValues) =>
    sendContact.mutate(values, {
      onSuccess: () => {
        haptics.success();
        toast.success('Message sent — we will be in touch shortly');
        reset();
      },
      onError: (err) => toast.error(getErrorMessage(err, "Couldn't send your message. Please try again.")),
    });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Concierge" title="Contact" />
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.giant }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text variant="heading" accessibilityRole="header">
              How may we help?
            </Text>
            <Text variant="body" color="secondary">
              Our concierge typically responds within one business day.
            </Text>
          </View>

          <ListGroup title="Reach us">
            <MenuRow icon={icon(Phone)} title="Call us" subtitle={PHONE} right={external} onPress={() => open(`tel:${PHONE.replace(/\s/g, '')}`)} />
            <MenuRow icon={icon(Mail)} title="Email" subtitle={EMAIL} right={external} onPress={() => open(`mailto:${EMAIL}`)} />
            <MenuRow icon={icon(MapPin)} title="Flagship Boutique" subtitle="The Dubai Mall, Fashion Avenue" showChevron={false} />
            <MenuRow icon={icon(Clock)} title="Hours" subtitle="Daily · 10:00 – 22:00" showChevron={false} />
          </ListGroup>

          <View style={[styles.form, { borderTopColor: colors.divider }]}>
            <Text variant="overline" color="muted" accessibilityRole="header">
              SEND A MESSAGE
            </Text>
            <FormField control={control} name="name" label="Name" placeholder="Your name" autoCapitalize="words" autoComplete="name" textContentType="name" />
            <FormField
              control={control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
            <FormField
              control={control}
              name="message"
              label="Message"
              placeholder="How can our concierge assist you?"
              multiline
              numberOfLines={5}
              style={styles.messageInput}
            />
            <Button label="Send Message" loading={sendContact.isPending} onPress={handleSubmit(onSubmit)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Layout.screenPadding, paddingTop: Spacing.xl, gap: Spacing.xxl },
  intro: { gap: Spacing.sm },
  form: { gap: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.xl },
  messageInput: { alignSelf: 'stretch', textAlignVertical: 'top', minHeight: 110 },
});
