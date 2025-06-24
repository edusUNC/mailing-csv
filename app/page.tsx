"use client"

import { useState, useEffect, useRef } from "react"
import { Container, Grid, Typography, Box, TextField, CircularProgress, useMediaQuery, useTheme, Button, Alert } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import UploadIcon from "@mui/icons-material/Upload"
import Papa from "papaparse"
import EmailDetail from "@/components/email-detail"
import EmailList from "@/components/email-list"
import FilterPanel from "@/components/filter-panel"
import type { Email } from "@/types/email"

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    deRoles: [] as string[],
    paraRoles: [] as string[],
    tags: [] as string[]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const cleanCsvValue = (value: string): string => {
    if (!value) return ""
    return value.trim()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No se seleccionó ningún archivo")
      return
    }

    // Limpiar errores previos
    setError(null)
    console.log("Archivo seleccionado:", file.name, "Tamaño:", file.size, "Tipo:", file.type)
    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      const csvData = e.target?.result as string
      console.log("CSV cargado, longitud:", csvData.length)
      console.log("Primeras 200 caracteres:", csvData.substring(0, 200))
      
      Papa.parse(csvData, {
        header: true,
        complete: (results: any) => {
          console.log("Parsing completado:", results)
          console.log("Número de filas:", results.data.length)
          console.log("Primera fila:", results.data[0])
          
          if (results.data.length === 0) {
            setError("El archivo CSV está vacío o no tiene datos válidos")
            setLoading(false)
            return
          }
          
          const parsedEmails: Email[] = results.data.map((row: any, index: number) => ({
            id: index,
            fecha: cleanCsvValue(row.fecha),
            de: cleanCsvValue(row.de) || "Unknown",
            para: cleanCsvValue(row.para),
            asunto: cleanCsvValue(row.asunto) || "(No Subject)",
            es_respuesta: cleanCsvValue(row.es_respuesta),
            cuerpo: cleanCsvValue(row.cuerpo),
            cc: cleanCsvValue(row.cc),
            bcc: cleanCsvValue(row.bcc),
            message_id: cleanCsvValue(row.message_id),
            in_reply_to: cleanCsvValue(row.in_reply_to),
            references: cleanCsvValue(row.references),
            adjuntos: cleanCsvValue(row.adjuntos),
            tipo_mail: cleanCsvValue(row.tipo_mail),
            de_rol: cleanCsvValue(row.de_rol),
            para_rol: cleanCsvValue(row.para_rol),
            tag_tema: cleanCsvValue(row.tag_tema),
            read: false,
          }))

          console.log("Emails parseados:", parsedEmails.length)
          setEmails(parsedEmails)
          setFilteredEmails(parsedEmails)
          if (parsedEmails.length > 0) {
            setSelectedEmail(parsedEmails[0])
          }
          setLoading(false)
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error)
          setError(`Error al procesar el archivo CSV: ${error.message}`)
          setLoading(false)
        },
      })
    }

    reader.onerror = (error) => {
      console.error("Error leyendo archivo:", error)
      setError("Error al leer el archivo. Asegúrate de que sea un archivo CSV válido.")
      setLoading(false)
    }

    reader.readAsText(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    let filtered = emails

    // Aplicar filtros de roles y tags
    if (filters.deRoles.length > 0) {
      filtered = filtered.filter(email => 
        email.de_rol && filters.deRoles.some(role => 
          email.de_rol.split(',').map(r => r.trim()).includes(role)
        )
      )
    }

    if (filters.paraRoles.length > 0) {
      filtered = filtered.filter(email => 
        email.para_rol && filters.paraRoles.some(role => 
          email.para_rol.split(',').map(r => r.trim()).includes(role)
        )
      )
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(email => 
        email.tag_tema && filters.tags.some(tag => 
          email.tag_tema.split(',').map(t => t.trim()).includes(tag)
        )
      )
    }

    // Aplicar búsqueda de texto
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (email) =>
          email.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.de.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.para.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.tag_tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.cuerpo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEmails(filtered)
  }, [searchTerm, emails, filters])

  const handleFiltersChange = (newFilters: {
    deRoles: string[]
    paraRoles: string[]
    tags: string[]
  }) => {
    setFilters(newFilters)
  }

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email)

    // Mark email as read
    setEmails((prevEmails) => prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Visor de Emails
      </Typography>

      {emails.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Sube un archivo CSV para comenzar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            El archivo debe contener las columnas: fecha, de, para, asunto, es_respuesta, cuerpo, cc, bcc, message_id, in_reply_to, references, adjuntos, tipo_mail, de_rol, para_rol, tag_tema
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {error}
            </Alert>
          )}
          
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
            size="large"
          >
            Subir archivo CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <SearchIcon sx={{ color: "text.secondary" }} />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar emails..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleUploadClick}
            >
              Cambiar archivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </Box>

          <FilterPanel 
            emails={emails} 
            onFiltersChange={handleFiltersChange} 
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isMobile ? (
              // Mobile layout - stacked
              <>
                {!selectedEmail ? (
                  <Box>
                    <EmailList
                      emails={filteredEmails}
                      selectedEmailId={(selectedEmail as Email | null)?.id}
                      onEmailSelect={handleEmailSelect}
                    />
                  </Box>
                ) : (
                  <Box>
                    <EmailDetail email={selectedEmail} onBack={() => setSelectedEmail(null)} />
                  </Box>
                )}
              </>
            ) : (
              // Desktop layout - side by side
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: '0 0 33.333%' }}>
                  <EmailList
                    emails={filteredEmails}
                    selectedEmailId={(selectedEmail as Email | null)?.id}
                    onEmailSelect={handleEmailSelect}
                  />
                </Box>
                <Box sx={{ flex: '1' }}>
                  {selectedEmail && <EmailDetail email={selectedEmail} />}
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  )
}
