import { useRef, useState } from 'react';
import { useOCR } from '../hooks/useOCR';

export default function OCRUpload({ onAnalyze }) {
  const fileRef = useRef();
  const { extractText, progress, isLoading } = useOCR();
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    const text = await extractText(file);
    console.log('OCR extracted text:', text);
    if (text.trim()) await onAnalyze(text);
  };

  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:24}}>
      <label style={{display:'block',fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--muted2)',marginBottom:10}}>
        Upload Screenshot (WhatsApp / Telegram / LinkedIn)
      </label>
      <div
        onClick={() => fileRef.current.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{border:`2px dashed ${dragOver?'var(--accent2)':'var(--border)'}`,borderRadius:12,padding:'28px 16px',textAlign:'center',cursor:'pointer',transition:'all 0.2s',background:dragOver?'rgba(0,229,176,0.05)':'var(--bg)'}}
      >
        {preview
          ? <img src={preview} alt="preview" style={{maxHeight:80,borderRadius:8,marginBottom:8,maxWidth:'100%'}} />
          : <div style={{fontSize:32,marginBottom:8}}>📸</div>
        }
        <p style={{fontSize:13,color:'var(--muted2)'}}>Drag & drop or click to upload</p>
        <p style={{fontSize:11,color:'var(--muted)',marginTop:4}}>PNG, JPG supported</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => processFile(e.target.files[0])} />
      {isLoading && (
        <div style={{marginTop:14}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:6,color:'var(--muted2)'}}>
            <span>Extracting text via OCR...</span><span>{progress}%</span>
          </div>
          <div style={{height:4,borderRadius:2,background:'var(--border)'}}>
            <div style={{height:4,borderRadius:2,background:'var(--accent2)',width:`${progress}%`,transition:'width 0.3s'}}/>
          </div>
        </div>
      )}
    </div>
  );
}