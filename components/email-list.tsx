"use client"

import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Box } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import type { Email } from "@/types/email"

interface EmailListProps {
  emails: Email[]
  selectedEmailId: number | undefined
  onEmailSelect: (email: Email) => void
}

export default function EmailList({ emails, selectedEmailId, onEmailSelect }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <Paper sx={{ p: 2, height: "100%" }}>
        <Typography variant="body1">No emails found</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ height: "70vh", overflow: "auto" }}>
      <List disablePadding>
        {emails.map((email, index) => (
          <Box key={email.id}>
            <ListItem
              onClick={() => onEmailSelect(email)}
              sx={{
                bgcolor: email.id === selectedEmailId ? "primary.light" : (email.read ? "transparent" : "action.hover"),
                cursor: "pointer",
                "&:hover": {
                  bgcolor: email.id === selectedEmailId ? "primary.light" : "action.hover",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>{email.read ? <MarkEmailReadIcon /> : <EmailIcon />}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: email.read ? "normal" : "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {email.asunto}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {email.de}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {email.tag_tema ? 
                        email.tag_tema.split(',').slice(0, 2).map(tag => tag.trim()).join(', ') + 
                        (email.tag_tema.split(',').length > 2 ? '...' : '')
                        : "Sin etiquetas"
                      }
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < emails.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  )
}
