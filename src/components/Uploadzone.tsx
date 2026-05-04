
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, FileImage, CheckCircle, XCircle, CloudUpload, Loader2, Tag, X, AlertTriangle } from 'lucide-react'
import type { DocumentCategory, UploadState } from '../types'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, formatFileSize, generateId } from '../utils'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg','.jpeg'], 'image/png': ['.png'],
  'image/webp': ['.webp'], 'image/tiff': ['.tiff','.tif'], 'image/bmp': ['.bmp'],
}
const MAX_SIZE = 10 * 1024 * 1024

export const UploadZone: React.FC = () => {
  const { addDocument } = useApp()
  const [tagInput, setTagInput] = useState('')
  const [state, setState] = useState<UploadState>({
    file: null, preview: null, category: 'Sales', tags: [], progress: 0, status: 'idle',
  })

  const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
    if (rejected && (rejected as File[]).length > 0) { toast.error('Invalid file. JPG, PNG, WebP, TIFF, BMP under 10MB.'); return }
    const file = accepted[0]; if (!file) return
    setState(prev => ({ ...prev, file, preview: URL.createObjectURL(file), status:'idle', progress:0, errorMessage:undefined, resultDocument:undefined }))
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ onDrop, accept: ACCEPTED_TYPES, maxSize: MAX_SIZE, maxFiles: 1 })

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g,'-')
    if (tag && !state.tags.includes(tag)) setState(prev => ({ ...prev, tags:[...prev.tags, tag] }))
    setTagInput('')
  }
  const removeTag = (t: string) => setState(prev => ({ ...prev, tags:prev.tags.filter(x => x !== t) }))

  const handleUpload = async () => {
    if (!state.file || state.status === 'uploading') return
    setState(prev => ({ ...prev, status:'uploading', progress:0 }))
    try {
      const stages = [
        {p:15,d:300}, {p:35,d:600}, {p:65,d:800}, {p:85,d:500}, {p:100,d:300},
      ]
      for (const s of stages) { await new Promise(r => setTimeout(r, s.d)); setState(prev => ({ ...prev, progress:s.p })) }
      const mockDoc = {
        id: generateId(), fileName: state.file.name.replace(/\.[^/.]+$/,'') + '.pdf',
        originalName: state.file.name, category: state.category,
        blobUrl: `https://udyogsarathi.blob.core.windows.net/documents/${generateId()}.pdf`,
        fileSize: state.file.size, uploadedAt: new Date().toISOString(),
        status: 'uploaded' as const, tags: state.tags, uploadedBy:'Admin', pageCount:1,
      }
      addDocument(mockDoc)
      setState(prev => ({ ...prev, status:'success', resultDocument:mockDoc }))
      toast.success('Document uploaded to Azure Blob!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setState(prev => ({ ...prev, status:'error', errorMessage:msg, progress:0 }))
      toast.error('Upload failed — transaction rolled back.')
    }
  }

  const handleReset = () => {
    if (state.preview) URL.revokeObjectURL(state.preview)
    setState({ file:null, preview:null, category:'Sales', tags:[], progress:0, status:'idle' })
    setTagInput('')
  }

  const colors = CATEGORY_COLORS[state.category]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Two-column on tablet+, single on mobile ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
        gap:20, alignItems:'start',
      }}>

        {/* LEFT: Drop zone + config */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <AnimatePresence mode="wait">
            {state.status === 'success' ? (
              <SuccessState key="success" doc={state.resultDocument} onReset={handleReset} />
            ) : (
              <motion.div key="dropzone" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {/* Drop area */}
                <div {...getRootProps()} style={{
                  border: `2px dashed ${isDragReject ? '#ef4444' : isDragActive ? '#f97316' : state.file ? `${colors.accent}60` : 'rgba(255,255,255,0.12)'}`,
                  borderRadius:18, padding:'clamp(24px,5vw,40px)', textAlign:'center', cursor:'pointer',
                  background: isDragActive ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
                  transition:'all 0.2s ease', position:'relative', overflow:'hidden',
                }}>
                  <input {...getInputProps()}/>
                  {state.file ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                      <FileImage size={32} color={colors.text}/>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:'#f0f4ff', wordBreak:'break-all' }}>{state.file.name}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{formatFileSize(state.file.size)}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); handleReset() }} style={{ fontSize:12, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'4px 12px', cursor:'pointer' }}>
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                      <div style={{ width:56, height:56, borderRadius:14, background: isDragActive ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${isDragActive ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {isDragReject ? <XCircle size={26} color="#ef4444"/> : isDragActive ? <CloudUpload size={26} color="#f97316"/> : <Image size={26} color="rgba(255,255,255,0.3)"/>}
                      </div>
                      <div>
                        <div style={{ fontSize:'clamp(13px,2vw,15px)', fontWeight:600, color: isDragReject ? '#ef4444' : isDragActive ? '#f97316' : '#f0f4ff', marginBottom:6 }}>
                          {isDragReject ? 'Invalid file type' : isDragActive ? 'Drop to upload' : 'Drop image or tap to browse'}
                        </div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
                          JPG, PNG, WebP, TIFF, BMP · Max 10MB<br/>Converted to PDF server-side via FastAPI
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category selector */}
                <div style={{ background:'rgba(21,34,64,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 18px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Document Category</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {CATEGORIES.map(cat => {
                      const c = CATEGORY_COLORS[cat]; const sel = state.category === cat
                      return (
                        <button key={cat} onClick={() => setState(prev => ({ ...prev, category: cat as DocumentCategory }))} style={{
                          padding:'9px 8px', borderRadius:10, cursor:'pointer', transition:'all 0.15s ease',
                          border:`1px solid ${sel ? c.accent+'50' : 'rgba(255,255,255,0.07)'}`,
                          background: sel ? c.bg : 'rgba(255,255,255,0.02)',
                          color: sel ? c.text : 'rgba(255,255,255,0.5)',
                          fontSize:12, fontWeight: sel ? 600 : 400,
                          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                        }}>
                          <span style={{ fontSize:16 }}>{CATEGORY_ICONS[cat]}</span>
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ background:'rgba(21,34,64,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 18px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                    <Tag size={11}/> Tags
                  </div>
                  <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <input type="text" placeholder="Add tag (Enter)" value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      style={{ flex:1, height:36, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'0 12px', fontSize:13, color:'#f0f4ff', outline:'none' }}/>
                    <button onClick={addTag} style={{ padding:'0 14px', height:36, borderRadius:8, background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.25)', color:'#f97316', fontSize:13, fontWeight:600, cursor:'pointer' }}>Add</button>
                  </div>
                  {state.tags.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {state.tags.map(tag => (
                        <motion.span key={tag} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                          style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, fontSize:12, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)' }}>
                          #{tag}
                          <button onClick={() => removeTag(tag)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', lineHeight:1, display:'flex', padding:0 }}><X size={11}/></button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Preview + pipeline + action */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Preview */}
          <div style={{ background:'rgba(21,34,64,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Preview</div>
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)' }}>
              {state.preview ? (
                <img src={state.preview} alt="Preview" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', padding:8 }}/>
              ) : (
                <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)' }}>
                  <Image size={32} style={{ marginBottom:6, opacity:0.3 }}/>
                  <div style={{ fontSize:12 }}>No image selected</div>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline steps */}
          <div style={{ background:'rgba(21,34,64,0.8)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 18px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Upload Pipeline</div>
            {[
              {step:'01', label:'Image → FastAPI',     sub:'Azure App Service (F1)', orange:false},
              {step:'02', label:'PDF conversion',       sub:'In-memory processing',  orange:false},
              {step:'03', label:'Azure Blob upload',    sub:'Secure URL returned',   orange:false},
              {step:'04', label:'PostgreSQL record',    sub:'SQLAlchemy transaction', orange:false},
              {step:'⚡', label:'Fail-safe rollback',  sub:'Auto-deletes orphans',  orange:true},
            ].map(({step,label,sub,orange},i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom: i < 4 ? 10 : 0 }}>
                <div style={{ width:24, height:24, borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', background: orange ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)', border:`1px solid ${orange ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)'}`, color: orange ? '#f97316' : '#60a5fa' }}>{step}</div>
                <div><div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.7)' }}>{label}</div><div style={{ fontSize:10.5, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{sub}</div></div>
              </div>
            ))}
          </div>

          {/* Progress + button */}
          {state.status !== 'success' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {state.status === 'uploading' && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Processing pipeline...</span>
                    <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'#f97316', fontWeight:600 }}>{state.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <motion.div className="progress-fill" animate={{ width:`${state.progress}%` }} transition={{ duration:0.4, ease:'easeOut' }} style={{ width:`${state.progress}%` }}/>
                  </div>
                </div>
              )}
              {state.status === 'error' && (
                <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <AlertTriangle size={14} color="#f87171" style={{ flexShrink:0, marginTop:1 }}/>
                  <div>
                    <div style={{ fontSize:12.5, color:'#f87171', fontWeight:600 }}>Upload Failed</div>
                    <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{state.errorMessage || 'Transaction rolled back.'}</div>
                  </div>
                </div>
              )}
              <motion.button whileHover={state.file && state.status !== 'uploading' ? { scale:1.02 } : {}} whileTap={state.file && state.status !== 'uploading' ? { scale:0.97 } : {}}
                onClick={handleUpload} disabled={!state.file || state.status === 'uploading'}
                style={{
                  width:'100%', height:48, borderRadius:12, border:'none', fontSize:14, fontWeight:700, cursor: (!state.file || state.status === 'uploading') ? 'not-allowed' : 'pointer',
                  background: (!state.file || state.status === 'uploading') ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#f97316,#ea6906)',
                  color: (!state.file || state.status === 'uploading') ? 'rgba(255,255,255,0.3)' : '#fff',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: (state.file && state.status !== 'uploading') ? '0 0 24px rgba(249,115,22,0.35)' : 'none',
                  transition:'all 0.2s ease',
                }}>
                {state.status === 'uploading' ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Uploading...</> : <><Upload size={16}/> Upload & Convert to PDF</>}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const SuccessState: React.FC<{ doc: ReturnType<typeof Object.create>; onReset: () => void }> = ({ doc, onReset }) => (
  <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
    style={{ padding:'clamp(24px,5vw,40px)', borderRadius:18, background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.2)', textAlign:'center' }}>
    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.1 }} style={{ marginBottom:14 }}>
      <CheckCircle size={44} color="#22c55e" style={{ margin:'0 auto' }}/>
    </motion.div>
    <h3 style={{ fontSize:'clamp(15px,3vw,18px)', fontWeight:700, color:'#f0f4ff', marginBottom:8 }}>Uploaded Successfully!</h3>
    <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:16, lineHeight:1.6 }}>Image → PDF → Azure Blob → PostgreSQL ✓</p>
    <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:18, fontFamily:'var(--font-mono)', fontSize:10.5, color:'#22c55e', wordBreak:'break-all', textAlign:'left' }}>
      {doc?.blobUrl || 'https://udyogsarathi.blob.core.windows.net/documents/...pdf'}
    </div>
    <button onClick={onReset} style={{ padding:'10px 24px', borderRadius:10, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}>
      <Upload size={13}/> Upload Another
    </button>
  </motion.div>
)