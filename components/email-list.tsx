"use client"

import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Box, Pagination } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import type { Email } from "@/types/email"

interface EmailListProps {
  emails: Email[]
  selectedEmailId: number | undefined
  onEmailSelect: (email: Email) => void
  page?: number
  onPageChange?: (page: number) => void
  itemsPerPage?: number
}

export default function EmailList({ 
  emails, 
  selectedEmailId, 
  onEmailSelect, 
  page = 1, 
  onPageChange, 
  itemsPerPage = 50 
}: EmailListProps) {
  if (emails.length === 0) {
    return (
      <Paper sx={{ p: 2, height: "100%" }}>
        <Typography variant="body1">No emails found</Typography>
      </Paper>
    )
  }

  // Calcular paginación
  const totalPages = Math.ceil(emails.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEmails = emails.slice(startIndex, endIndex)

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (onPageChange) {
      onPageChange(value)
    }
  }

  return (
    <Paper sx={{ height: "70vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List disablePadding>
          {paginatedEmails.map((email, index) => (
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.2,
                        maxHeight: "2.4em",
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
              {index < paginatedEmails.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
      
      {totalPages > 1 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            size="small"
            showFirstButton 
            showLastButton
          />
        </Box>
      )}
    </Paper>
  )
}
