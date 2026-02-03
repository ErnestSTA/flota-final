import React, { useState, useEffect } from 'react';
import { db } from './db';
import { 
  Container, TextField, Button, Typography, Paper, Box, 
  IconButton, CssBaseline, ThemeProvider, createTheme, 
  Checkbox, FormControlLabel, FormGroup 
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const theme = createTheme({
  palette: {
    primary: { main: '#D32F2F' },
    background: { default: '#F5F5F5' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', padding: '12px 0' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16, padding: '24px', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { backgroundColor: 'white' }
      }
    }
  },
});

type AppStep = 'start' | 'mode_selection' | 'contact_details' | 'form' | 'success';

function App() {
  const [step, setStep] = useState<AppStep>('start');
  const [plate, setPlate] = useState('WI 17009');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    rodo1: false,
    rodo2: false,
    rodo3: false
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrPlate = params.get('plate');
    if (qrPlate) setPlate(qrPlate);
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      let fullDescription = desc;
      if (contact.email || contact.phone) {
        fullDescription += `\n\n--- DANE KONTAKTOWE ---\nTel: ${contact.phone}\nEmail: ${contact.email}\nZgody: ${contact.rodo1 ? 'Tak' : 'Nie'}`;
      }

      await db.issues.add({
        plateNumber: plate,
        description: fullDescription || 'Brak opisu',
        photo: photo || undefined,
        date: new Date(),
        synced: false
      });
      setStep('success');
    } catch (error) {
      console.error(error);
      alert('Błąd zapisu');
    }
  };

  const renderStartScreen = () => (
    <Box textAlign="center" mt={4}>
      <Box sx={{ width: 80, height: 80, bgcolor: '#D32F2F', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
        LOGO
      </Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Zgłoszenie parkowania</Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Zgłoś parkowanie pojazdu służbowego w kilku prostych krokach
      </Typography>
      <Paper elevation={0} sx={{ bgcolor: '#E0E0E0', mb: 4 }}>
        <Typography variant="caption" display="block">Numer rejestracyjny:</Typography>
        <Typography variant="h5" fontWeight="900">{plate}</Typography>
      </Paper>
      <Button variant="contained" fullWidth onClick={() => setStep('mode_selection')}>
        Rozpocznij
      </Button>
    </Box>
  );

  const renderModeScreen = () => (
    <Box textAlign="center" mt={4}>
      <Button 
        variant="contained" 
        fullWidth 
        sx={{ minHeight: 100, mb: 3, fontSize: '1.1rem' }}
        onClick={() => setStep('contact_details')}
      >
        Zgłoszenie:<br/>(chcę otrzymać odpowiedź)
      </Button>

      <Button 
        variant="contained" 
        fullWidth 
        sx={{ minHeight: 100, bgcolor: '#C4C4C4', color: 'black', '&:hover': { bgcolor: '#A0A0A0' } }}
        onClick={() => setStep('form')}
      >
        Zgłoszenie:<br/>(bez odpowiedzi)
      </Button>
    </Box>
  );

  const renderContactScreen = () => (
    <Box mt={2}>
      <IconButton onClick={() => setStep('mode_selection')} sx={{ mb: 1 }}><ArrowBackIcon/></IconButton>
      <Typography variant="h6" fontWeight="bold">Dane kontaktowe</Typography>
      
      <TextField 
        fullWidth label="Telefon" margin="normal" 
        value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})}
      />
      <TextField 
        fullWidth label="Email" margin="normal" 
        value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})}
      />

      <FormGroup sx={{ mt: 2 }}>
        <FormControlLabel control={<Checkbox checked={contact.rodo1} onChange={(e) => setContact({...contact, rodo1: e.target.checked})} />} label="Akceptuję RODO 1" />
        <FormControlLabel control={<Checkbox checked={contact.rodo2} onChange={(e) => setContact({...contact, rodo2: e.target.checked})} />} label="Akceptuję RODO 2" />
        <FormControlLabel control={<Checkbox checked={contact.rodo3} onChange={(e) => setContact({...contact, rodo3: e.target.checked})} />} label="Akceptuję RODO 3" />
      </FormGroup>

      <Button variant="contained" fullWidth sx={{ mt: 4 }} onClick={() => setStep('form')} disabled={!contact.rodo1}>
        DALEJ
      </Button>
    </Box>
  );

  const renderFormScreen = () => (
    <Box textAlign="center" mt={2}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Opisz sytuację</Typography>

      <TextField 
        fullWidth 
        placeholder="Opis usterki / parkowania *" 
        multiline
        rows={6}
        variant="outlined" 
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        {!previewUrl ? (
          <Button 
            variant="outlined" 
            component="label" 
            startIcon={<CameraAltIcon />} 
            fullWidth
            sx={{ height: 60, borderStyle: 'dashed', borderWidth: 2 }}
          >
            DODAJ ZDJĘCIE
            <input type="file" hidden accept="image/*" capture="environment" onChange={handlePhotoCapture} />
          </Button>
        ) : (
          <Box position="relative" width="100%" height={200} borderRadius={2} overflow="hidden">
            <img src={previewUrl} alt="Podgląd" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Button 
              variant="contained" color="error" size="small" 
              startIcon={<DeleteIcon />}
              onClick={() => { setPhoto(null); setPreviewUrl(null); }}
              sx={{ position: 'absolute', bottom: 10, right: 10 }}
            >
              Usuń
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="h6" fontWeight="bold" gutterBottom>{plate}</Typography>

      <Button variant="contained" fullWidth size="large" onClick={handleSubmit} disabled={!desc}>
        WYŚLIJ ZGŁOSZENIE
      </Button>
    </Box>
  );

  const renderSuccessScreen = () => (
    <Box textAlign="center" mt={8}>
      <CheckCircleIcon sx={{ fontSize: 100, color: '#D32F2F', mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>Dziękujemy</Typography>
      <Typography variant="body1" color="text.secondary">Zgłoszenie zostało wysłane</Typography>
      <Button variant="outlined" sx={{ mt: 5 }} onClick={() => { setStep('start'); setPhoto(null); setDesc(''); setContact({phone:'', email:'', rodo1:false, rodo2:false, rodo3:false}); }}>
        Nowe zgłoszenie
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ minHeight: '100vh', py: 2 }}>
        {step === 'start' && renderStartScreen()}
        {step === 'mode_selection' && renderModeScreen()}
        {step === 'contact_details' && renderContactScreen()}
        {step === 'form' && renderFormScreen()}
        {step === 'success' && renderSuccessScreen()}
      </Container>
    </ThemeProvider>
  );
}

export default App;