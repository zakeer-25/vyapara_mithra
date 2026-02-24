
export type LanguageCode = 
  | 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'ur' | 'kn' | 'or' | 'ml' 
  | 'pa' | 'as' | 'sa' | 'brx' | 'doi' | 'kok' | 'mai' | 'mni' | 'ne' | 'sat' | 'sd' | 'ks';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface BusinessData {
  description: string;
  name?: string;
  phone: string;
  email?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface Translation {
  welcome: string;
  tell_me_about: string;
  placeholder_desc: string;
  btn_continue: string;
  contact_details: string;
  lbl_name: string;
  lbl_phone: string;
  lbl_email: string;
  lbl_address: string;
  btn_detect_location: string;
  btn_create: string;
  btn_update: string;
  generating: string;
  ready_msg: string;
  edit_placeholder: string;
  share_whatsapp: string;
  copy_link: string;
  preview_title: string;
  listening: string;
  tap_to_speak: string;
  tap_to_edit: string;
  invalid_phone: string;
  history_title: string;
  no_edits: string;
  btn_restore: string;
  btn_delete: string;
  confirm_delete: string;
  initial_website: string;
  restored_text: string;
  manual_edit: string;
  detecting: string;
  location_error: string;
  geo_not_supported: string;
  voice_not_supported: string;
  mithra_break: string;
  retry_msg: string;
  creating_shop_msg: string;
  share_text: string;
  placeholder_name: string;
  placeholder_address: string;
  placeholder_email: string;
  login_title: string;
  btn_send_otp: string;
  otp_title: string;
  otp_desc: string;
  btn_verify_login: string;
  invalid_otp: string;
  compulsory: string;
  lbl_copyright: string;
  lbl_update_website: string;
  lbl_edit_instruction: string;
  // Location detection states
  location_locked: string;
  location_detect: string;
  location_detecting_msg: string;
  lbl_accuracy: string;
  lbl_status: string;
  lbl_connecting: string;
  // Loader Steps
  step_analyzing: string;
  step_designing: string;
  step_coloring: string;
  step_finalizing: string;
  // Finalize
  btn_confirm: string;
}

export type Translations = Record<LanguageCode, Translation>;

export interface HistoryItem {
  id: string;
  html: string;
  instruction: string;
  timestamp: number;
}
