export interface Email {
  id: number
  fecha: string
  de: string
  para: string
  asunto: string
  es_respuesta: string
  cuerpo: string
  cc: string
  bcc: string
  message_id: string
  in_reply_to: string
  references: string
  adjuntos: string
  tipo_mail: string
  de_rol: string
  para_rol: string
  tag_tema: string
  read: boolean
}
