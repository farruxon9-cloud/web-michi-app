const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const errorBoundaryCode = `
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);
    // If it's a chunk load error or dynamic import failure, reload the page
    if (error.name === 'ChunkLoadError' || error.message.includes('Failed to fetch dynamically imported module') || error.message.includes('dynamically imported module') || error.message.includes('fetch')) {
      if (!sessionStorage.getItem('michi_chunk_reloaded')) {
        sessionStorage.setItem('michi_chunk_reloaded', 'true');
        window.location.reload(true);
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>
          Yangi versiya mavjud. Iltimos sahifani yangilang (Ctrl+F5 yoki tepadan pastga torting).
          <br/><br/>
          <button onClick={() => window.location.reload(true)} style={{ padding: '10px 20px', borderRadius: '20px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            Sahifani Yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
`;

if (!app.includes('class ChunkErrorBoundary')) {
  // insert before function App()
  app = app.replace('function App() {', errorBoundaryCode + '\nfunction App() {');
  
  // wrap <Suspense> with <ChunkErrorBoundary>
  app = app.replace(/<Suspense fallback=\{<div style={{display:'flex', justifyContent:'center', padding:40, \ncolor:'#8E8E93'}}>{t\('loading', 'Yuklanmoqda\.\.\.'\)}<\/div>}>/g, 
    '<ChunkErrorBoundary><Suspense fallback={<div style={{display:\'flex\', justifyContent:\'center\', padding:40, color:\'#8E8E93\'}}>{t(\'loading\', \'Yuklanmoqda...\')}</div>}>');
    
  app = app.replace(/<Suspense fallback=\{<div style=\{\{display:'flex', justifyContent:'center', padding:40, color:'#8E8E93'\}\}>\{t\('loading', 'Yuklanmoqda\.\.\.'\)\}<\/div>\}>/g, 
    '<ChunkErrorBoundary><Suspense fallback={<div style={{display:\'flex\', justifyContent:\'center\', padding:40, color:\'#8E8E93\'}}>{t(\'loading\', \'Yuklanmoqda...\')}</div>}>');

  app = app.replace(/<\/Suspense>/g, '</Suspense></ChunkErrorBoundary>');
  
  fs.writeFileSync('src/App.jsx', app, 'utf8');
  console.log("Added ChunkErrorBoundary!");
} else {
  console.log("ChunkErrorBoundary already exists.");
}
