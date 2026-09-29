export const CONTACT_PHONE = "917204113614";
export const CONTACT_PHONE_DISPLAY = "+91 72041 13614";

export const WHATSAPP_REQUIREMENTS_MESSAGE = [
  "Hi Dandeli Direct, I'm planning a trip to Dandeli and would like help.",
  "",
  "Preferred dates:",
  "Number of guests:",
  "Preferred stay or budget:",
  "Activities you're interested in:",
  "Any special requirements:",
  "",
  "Please share availability and a quote. I can provide any missing details here.",
].join("\n");

export function createWhatsAppUrl(message: string) {
  const parameters = new URLSearchParams({ text: message });
  return `https://wa.me/${CONTACT_PHONE}?${parameters.toString()}`;
}
