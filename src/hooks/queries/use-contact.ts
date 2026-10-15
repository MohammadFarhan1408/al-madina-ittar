import { useMutation } from '@tanstack/react-query';

import { contactService, type ContactInput } from '@/services';

export const useSendContact = () =>
  useMutation({ mutationFn: (input: ContactInput) => contactService.send(input) });

export const useSubscribeNewsletter = () =>
  useMutation({ mutationFn: (email: string) => contactService.subscribe(email) });
