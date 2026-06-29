/**
 * ContactScreen — contact channels and a validated message form (mock submit).
 */
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ArtDecoDivider } from '@/components/brand';
import { StackHeader } from '@/components/layout';
import { Button, Card, FormField, MenuRow, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast } from '@/store';
import { haptics, zodResolver } from '@/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  message: z.string().min(10, 'Your message is a little short'),
});
type ContactValues = z.infer<typeof contactSchema>;

export function ContactScreen() {
  const { colors } = useTheme();
  const { control, handleSubmit, reset, formState } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const icon = (Ic: typeof Phone) => <Ic size={IconSize.sm} color={colors.accent} strokeWidth={1.75} />;

  const onSubmit = () => {
    haptics.success();
    toast.success('Message sent — we will be in touch shortly');
    reset();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="We're here to help" title="Contact" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card padded={false}>
            <View style={styles.menuInner}>
              <MenuRow icon={icon(Phone)} title="Call Us" subtitle="+971 4 000 0000" showChevron={false} />
              <MenuRow icon={icon(Mail)} title="Email" subtitle="concierge@almadina.com" showChevron={false} />
              <MenuRow icon={icon(MapPin)} title="Flagship Boutique" subtitle="The Dubai Mall, Fashion Avenue" showChevron={false} />
              <MenuRow icon={icon(Clock)} title="Hours" subtitle="Daily · 10:00 – 22:00" showChevron={false} />
            </View>
          </Card>

          <ArtDecoDivider label="SEND A MESSAGE" style={styles.divider} />

          <View style={styles.form}>
            <FormField control={control} name="name" label="Name" placeholder="Your name" autoCapitalize="words" />
            <FormField control={control} name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <FormField
              control={control}
              name="message"
              label="Message"
              placeholder="How can our concierge assist you?"
              multiline
              numberOfLines={4}
              style={styles.messageInput}
            />
            <Button
              label="Send Message"
              variant="gradient"
              glow
              loading={formState.isSubmitting}
              leftIcon={<Send size={IconSize.sm} color={colors.text.onAccent} strokeWidth={2} />}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <Text variant="caption" color="muted" align="center" style={styles.note}>
            Our concierge typically responds within one business day.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  menuInner: { paddingHorizontal: Spacing.lg },
  divider: { alignSelf: 'center', marginTop: Spacing.sm },
  form: { gap: Spacing.lg },
  messageInput: { alignSelf: 'stretch', textAlignVertical: 'top' },
  note: { marginTop: Spacing.sm },
});
