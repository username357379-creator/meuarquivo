import { useState, useRef, useEffect } from "react";

// ── CONFIG: substitui pelo teu Google Client ID ──────────────────────
const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_AQUI";

const STORAGE_KEY = "docvault_v3";

function loadData(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + "_" + userId);
    return raw ? JSON.parse(raw) : { folders: [], docs: [], todos: [] };
  } catch { return { folders: [], docs: [], todos: [] }; }
}
function saveData(userId, d) { localStorage.setItem(STORAGE_KEY + "_" + userId, JSON.stringify(d)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Icons ──────────────────────────────────────────────────────────────
const IFolder = ({size=22,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>;
const IPlus   = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ICamera = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IBack   = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IEdit   = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ITrash  = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const ICheck  = ({size=16,done}) => <svg width={size} height={size} viewBox="0 0 24 24" fill={done?"#4ade80":"none"} stroke={done?"#4ade80":"#444"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/>{done&&<polyline points="9 12 11 14 15 10"/>}</svg>;
const ILogout = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

// ── Google Login Screen ────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => initGoogle();
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const initGoogle = () => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "filled_black", size: "large", text: "signin_with", shape: "pill", width: 280 }
    );
  };

  const handleCredential = (response) => {
    setLoading(true);
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      onLogin({ id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture });
    } catch {
      setError("Erro ao entrar. Tenta novamente.");
      setLoading(false);
    }
  };

  return (
    <div style={ls.root}>
      <div style={ls.card}>
        <div style={ls.logoMark}>◆</div>
        <div style={ls.title}>Arquivo</div>
        <div style={ls.sub}>O teu organizador de documentos pessoal</div>
        <div style={ls.divider}/>
        {loading
          ? <div style={ls.loading}>A entrar...</div>
          : <>
              <div id="google-btn" style={{display:"flex",justifyContent:"center"}}/>
              {GOOGLE_CLIENT_ID === "SEU_CLIENT_ID_AQUI" && (
                <div style={ls.warning}>
                  ⚠️ Para ativar o login com Google, substitui o <b>GOOGLE_CLIENT_ID</b> no código pelo teu Client ID.
                  <br/><br/>
                  Enquanto isso, podes usar sem login:
                  <button style={ls.guestBtn} onClick={() => onLogin({ id: "guest", name: "Convidado", email: "", picture: "" })}>
                    Entrar como Convidado
                  </button>
                </div>
              )}
              {error && <div style={ls.error}>{error}</div>}
            </>
        }
      </div>
      <div style={ls.footer}>Os teus documentos ficam guardados neste dispositivo</div>
    </div>
  );
}

const ls = {
  root:     { minHeight:"100vh", background:"#0f0f0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Instrument Sans',sans-serif" },
  card:     { background:"#161616", border:"1px solid #222", borderRadius:24, padding:"40px 32px", width:"100%", maxWidth:360, display:"flex", flexDirection:"column", alignItems:"center", gap:12 },
  logoMark: { fontSize:32, color:"#c9a96e", marginBottom:4 },
  title:    { fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:700, color:"#f0f0f0", letterSpacing:"-0.02em" },
  sub:      { fontSize:14, color:"#555", textAlign:"center", lineHeight:1.5 },
  divider:  { width:40, height:1, background:"#222", margin:"12px 0" },
  loading:  { fontSize:14, color:"#555" },
  warning:  { marginTop:16, background:"#1a1500", border:"1px solid #3a3000", borderRadius:12, padding:"14px 16px", fontSize:13, color:"#a09060", lineHeight:1.6, textAlign:"center", width:"100%" },
  guestBtn: { display:"block", marginTop:14, width:"100%", padding:"11px", borderRadius:10, background:"#f0f0f0", color:"#0f0f0f", fontSize:14, fontWeight:600, fontFamily:"'Instrument Sans',sans-serif", cursor:"pointer", border:"none" },
  error:    { fontSize:13, color:"#e05555", marginTop:8 },
  footer:   { marginTop:24, fontSize:12, color:"#333", textAlign:"center" },
};

// ── Main App ──────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]               = useState(() => {
    try { const u = localStorage.getItem("docvault_user"); return u ? JSON.parse(u) : null; } catch { return null; }
  });
  const [data, setData]               = useState(() => user ? loadData(user.id) : { folders:[], docs:[], todos:[] });
  const [view, setView]               = useState("home");
  const [tab, setTab]                 = useState("docs");
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeDoc, setActiveDoc]     = useState(null);
  const [modal, setModal]             = useState(null);
  const [modalInput, setModalInput]   = useState("");
  const [modalTarget, setModalTarget] = useState(null);
  const [todoInput, setTodoInput]     = useState("");
  const fileRef = useRef();

  const handleLogin = (u) => {
    localStorage.setItem("docvault_user", JSON.stringify(u));
    setUser(u);
    setData(loadData(u.id));
  };

  const handleLogout = () => {
    localStorage.removeItem("docvault_user");
    setUser(null);
    setData({ folders:[], docs:[], todos:[] });
    setView("home");
  };

  const persist = d => { setData(d); saveData(user.id, d); };
  const activeFolder = data.folders.find(f => f.id === activeFolderId);
  const folderDocs   = data.docs.filter(d => d.folderId === activeFolderId);
  const folderTodos  = data.todos.filter(t => t.folderId === activeFolderId);
  const fmt = ts => new Date(ts).toLocaleDateString("pt-PT", { day:"2-digit", month:"short", year:"numeric" });

  // Folder
  const createFolder = () => {
    if (!modalInput.trim()) return;
    persist({ ...data, folders: [...data.folders, { id:genId(), name:modalInput.trim(), createdAt:Date.now() }] });
    setModal(null); setModalInput("");
  };
  const renameFolder = () => {
    if (!modalInput.trim()) return;
    persist({ ...data, folders: data.folders.map(f => f.id===modalTarget ? {...f,name:modalInput.trim()} : f) });
    setModal(null); setModalInput(""); setModalTarget(null);
  };
  const deleteFolder = () => {
    persist({ folders:data.folders.filter(f=>f.id!==modalTarget), docs:data.docs.filter(d=>d.folderId!==modalTarget), todos:data.todos.filter(t=>t.folderId!==modalTarget) });
    setModal(null); setModalTarget(null);
    if (activeFolderId===modalTarget) { setView("home"); setActiveFolderId(null); }
  };

  // Docs
  const handleFile = e => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      r.onload = ev => setData(prev => {
        const nd = { ...prev, docs:[...prev.docs,{id:genId(),folderId:activeFolderId,name:file.name.replace(/\.[^.]+$/,""),image:ev.target.result,createdAt:Date.now()}] };
        saveData(user.id, nd); return nd;
      });
      r.readAsDataURL(file);
    });
    e.target.value="";
  };
  const renameDoc = () => {
    if (!modalInput.trim()) return;
    persist({ ...data, docs:data.docs.map(d=>d.id===modalTarget?{...d,name:modalInput.trim()}:d) });
    setModal(null); setModalInput(""); setModalTarget(null);
  };
  const deleteDoc = () => {
    persist({ ...data, docs:data.docs.filter(d=>d.id!==modalTarget) });
    setModal(null); setModalTarget(null);
    if (activeDoc?.id===modalTarget) { setView("folder"); setActiveDoc(null); }
  };

  // Todos
  const addTodo    = () => { if(!todoInput.trim())return; persist({...data,todos:[...data.todos,{id:genId(),folderId:activeFolderId,text:todoInput.trim(),done:false,createdAt:Date.now()}]}); setTodoInput(""); };
  const toggleTodo = id => persist({...data,todos:data.todos.map(t=>t.id===id?{...t,done:!t.done}:t)});
  const deleteTodo = id => persist({...data,todos:data.todos.filter(t=>t.id!==id)});

  const openModal    = (type,target=null,prefill="") => { setModal(type); setModalTarget(target); setModalInput(prefill); };
  const confirmModal = () => {
    if(modal==="newFolder") createFolder();
    else if(modal==="renameFolder") renameFolder();
    else if(modal==="renameDoc") renameDoc();
    else if(modal==="deleteFolder") deleteFolder();
    else if(modal==="deleteDoc") deleteDoc();
  };

  const doneTodos  = folderTodos.filter(t=>t.done).length;
  const totalTodos = folderTodos.length;

  if (!user) return <LoginScreen onLogin={handleLogin}/>;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Instrument+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        body{background:#0f0f0f;}
        input,textarea{outline:none;}
        button{cursor:pointer;border:none;background:none;}
        img{display:block;}
      `}</style>

      {/* HOME */}
      {view==="home" && <>
        <div style={s.header}>
          <div>
            <div style={s.label}>Bem-vindo, {user.name.split(" ")[0]}</div>
            <div style={s.title}>Arquivo</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user.picture && <img src={user.picture} style={{width:34,height:34,borderRadius:"50%",border:"2px solid #222"}}/>}
            <button style={s.addBtn} onClick={()=>openModal("newFolder")}><IPlus size={18}/></button>
            <button style={{...s.iconBtn,color:"#666"}} onClick={handleLogout}><ILogout/></button>
          </div>
        </div>
        <div style={s.content}>
          {data.folders.length===0
            ? <div style={s.empty}><IFolder size={40} color="#2a2a2a"/><div style={s.emptyT}>Sem pastas ainda</div><div style={s.emptySub}>Toca em + para criar a primeira pasta</div></div>
            : <div style={s.list}>
                {data.folders.map(folder => {
                  const cnt  = data.docs.filter(d=>d.folderId===folder.id).length;
                  const tcnt = data.todos.filter(t=>t.folderId===folder.id&&!t.done).length;
                  const thumb= data.docs.find(d=>d.folderId===folder.id);
                  return (
                    <div key={folder.id} style={s.card} onClick={()=>{setActiveFolderId(folder.id);setTab("docs");setView("folder");}}>
                      <div style={s.thumb}>
                        {thumb?<img src={thumb.image} style={s.thumbImg}/>:<IFolder size={28} color="#2a2a2a"/>}
                      </div>
                      <div style={s.cardInfo}>
                        <div style={s.cardName}>{folder.name}</div>
                        <div style={s.cardMeta}>
                          {cnt} doc{cnt!==1?"s":""}
                          {tcnt>0&&<span style={s.badge}>{tcnt} tarefa{tcnt!==1?"s":""}</span>}
                        </div>
                      </div>
                      <div style={s.cardActs}>
                        <button style={s.iconBtn} onClick={e=>{e.stopPropagation();openModal("renameFolder",folder.id,folder.name)}}><IEdit/></button>
                        <button style={{...s.iconBtn,color:"#e05555"}} onClick={e=>{e.stopPropagation();openModal("deleteFolder",folder.id)}}><ITrash/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </>}

      {/* FOLDER */}
      {view==="folder" && activeFolder && <>
        <div style={s.header}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button style={s.backBtn} onClick={()=>{setView("home");setActiveFolderId(null);}}><IBack/></button>
            <div>
              <div style={s.label}>{folderDocs.length} doc{folderDocs.length!==1?"s":""} · {doneTodos}/{totalTodos} tarefas</div>
              <div style={s.title}>{activeFolder.name}</div>
            </div>
          </div>
          {tab==="docs"&&<button style={s.addBtn} onClick={()=>fileRef.current?.click()}><ICamera size={18}/></button>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={handleFile}/>

        <div style={s.tabs}>
          <button style={{...s.tabBtn,...(tab==="docs"?s.tabActive:{})}} onClick={()=>setTab("docs")}>Documentos</button>
          <button style={{...s.tabBtn,...(tab==="todos"?s.tabActive:{})}} onClick={()=>setTab("todos")}>
            Tarefas {totalTodos>0&&<span style={s.tabCount}>{totalTodos}</span>}
          </button>
        </div>

        <div style={s.content}>
          {tab==="docs" && (
            folderDocs.length===0
              ? <div style={s.empty}><ICamera size={36}/><div style={s.emptyT}>Sem documentos</div><div style={s.emptySub}>Toca na câmara para adicionar</div></div>
              : <div style={s.list}>
                  {folderDocs.map(doc=>(
                    <div key={doc.id} style={s.card} onClick={()=>{setActiveDoc(doc);setView("docview");}}>
                      <div style={{...s.thumb,width:56,height:56}}><img src={doc.image} style={s.thumbImg}/></div>
                      <div style={s.cardInfo}>
                        <div style={s.cardName}>{doc.name}</div>
                        <div style={s.cardMeta}>{fmt(doc.createdAt)}</div>
                      </div>
                      <div style={s.cardActs}>
                        <button style={s.iconBtn} onClick={e=>{e.stopPropagation();openModal("renameDoc",doc.id,doc.name)}}><IEdit/></button>
                        <button style={{...s.iconBtn,color:"#e05555"}} onClick={e=>{e.stopPropagation();openModal("deleteDoc",doc.id)}}><ITrash/></button>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {tab==="todos" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={s.todoInput}>
                <input style={s.todoInputField} placeholder="Nova tarefa..." value={todoInput} onChange={e=>setTodoInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()}/>
                <button style={{...s.addBtn,width:36,height:36,borderRadius:10,flexShrink:0}} onClick={addTodo}><IPlus size={16}/></button>
              </div>
              {folderTodos.length===0
                ? <div style={{...s.empty,paddingTop:40}}><div style={s.emptyT}>Sem tarefas</div><div style={s.emptySub}>Adiciona a primeira tarefa acima</div></div>
                : <>
                    {folderTodos.filter(t=>!t.done).map(todo=>(
                      <div key={todo.id} style={s.todoCard}>
                        <button style={{flexShrink:0,display:"flex"}} onClick={()=>toggleTodo(todo.id)}><ICheck size={22} done={false}/></button>
                        <div style={s.todoText}>{todo.text}</div>
                        <button style={{...s.iconBtn,color:"#e05555",flexShrink:0}} onClick={()=>deleteTodo(todo.id)}><ITrash/></button>
                      </div>
                    ))}
                    {folderTodos.filter(t=>t.done).length>0&&<>
                      <div style={s.todoSep}>Concluídas</div>
                      {folderTodos.filter(t=>t.done).map(todo=>(
                        <div key={todo.id} style={{...s.todoCard,opacity:0.4}}>
                          <button style={{flexShrink:0,display:"flex"}} onClick={()=>toggleTodo(todo.id)}><ICheck size={22} done={true}/></button>
                          <div style={{...s.todoText,textDecoration:"line-through",color:"#555"}}>{todo.text}</div>
                          <button style={{...s.iconBtn,color:"#e05555",flexShrink:0}} onClick={()=>deleteTodo(todo.id)}><ITrash/></button>
                        </div>
                      ))}
                    </>}
                  </>
              }
            </div>
          )}
        </div>
      </>}

      {/* DOC VIEW */}
      {view==="docview" && activeDoc && <>
        <div style={s.header}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button style={s.backBtn} onClick={()=>{setView("folder");setActiveDoc(null);}}><IBack/></button>
            <div>
              <div style={s.label}>{activeFolder?.name}</div>
              <div style={s.title}>{activeDoc.name}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.iconBtn} onClick={()=>openModal("renameDoc",activeDoc.id,activeDoc.name)}><IEdit size={18}/></button>
            <button style={{...s.iconBtn,color:"#e05555"}} onClick={()=>openModal("deleteDoc",activeDoc.id)}><ITrash size={18}/></button>
          </div>
        </div>
        <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <img src={activeDoc.image} style={{width:"100%",borderRadius:16,border:"1px solid #222"}}/>
          <div style={{fontSize:12,color:"#555",textAlign:"center"}}>{fmt(activeDoc.createdAt)}</div>
        </div>
      </>}

      {/* MODAL */}
      {modal&&(
        <div style={s.overlay} onClick={()=>setModal(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            {(modal==="deleteFolder"||modal==="deleteDoc")?<>
              <div style={s.modalTitle}>Tens a certeza?</div>
              <div style={{fontSize:13,color:"#666",marginBottom:24}}>Esta ação não pode ser desfeita.</div>
              <div style={s.modalBtns}>
                <button style={s.modalCancel} onClick={()=>setModal(null)}>Cancelar</button>
                <button style={{...s.modalConfirm,background:"#e05555"}} onClick={confirmModal}>Eliminar</button>
              </div>
            </>:<>
              <div style={s.modalTitle}>{modal==="newFolder"?"Nova pasta":modal==="renameFolder"?"Renomear pasta":"Renomear documento"}</div>
              <input style={s.modalInput} value={modalInput} onChange={e=>setModalInput(e.target.value)} placeholder="Nome..." autoFocus onKeyDown={e=>e.key==="Enter"&&confirmModal()}/>
              <div style={s.modalBtns}>
                <button style={s.modalCancel} onClick={()=>setModal(null)}>Cancelar</button>
                <button style={s.modalConfirm} onClick={confirmModal}>Guardar</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root:      { fontFamily:"'Instrument Sans',sans-serif", minHeight:"100vh", background:"#0f0f0f", color:"#f0f0f0", display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" },
  header:    { padding:"52px 22px 18px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderBottom:"1px solid #1a1a1a" },
  label:     { fontSize:11, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 },
  title:     { fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:"#f0f0f0", letterSpacing:"-0.02em" },
  addBtn:    { width:42, height:42, borderRadius:12, background:"#f0f0f0", color:"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  backBtn:   { width:36, height:36, borderRadius:10, background:"#1e1e1e", color:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  iconBtn:   { width:32, height:32, borderRadius:8, background:"#1e1e1e", color:"#666", display:"flex", alignItems:"center", justifyContent:"center" },
  content:   { flex:1, padding:"16px 16px 32px" },
  empty:     { display:"flex", flexDirection:"column", alignItems:"center", gap:10, paddingTop:60, textAlign:"center", color:"#333" },
  emptyT:    { fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:600, color:"#333" },
  emptySub:  { fontSize:13, color:"#3a3a3a" },
  list:      { display:"flex", flexDirection:"column", gap:10 },
  card:      { background:"#161616", border:"1px solid #1e1e1e", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" },
  thumb:     { width:52, height:52, borderRadius:10, background:"#1e1e1e", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 },
  thumbImg:  { width:"100%", height:"100%", objectFit:"cover" },
  cardInfo:  { flex:1, minWidth:0 },
  cardName:  { fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:600, color:"#f0f0f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardMeta:  { fontSize:12, color:"#555", marginTop:3, display:"flex", alignItems:"center", gap:8 },
  badge:     { background:"#1a3a1a", color:"#4ade80", fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:500 },
  cardActs:  { display:"flex", gap:6, flexShrink:0 },
  tabs:      { display:"flex", borderBottom:"1px solid #1a1a1a", padding:"0 16px" },
  tabBtn:    { flex:1, padding:"12px 0", fontSize:13, fontWeight:500, color:"#555", fontFamily:"'Instrument Sans',sans-serif", background:"none", border:"none", borderBottom:"2px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 },
  tabActive: { color:"#f0f0f0", borderBottomColor:"#f0f0f0" },
  tabCount:  { background:"#2a2a2a", color:"#888", fontSize:10, padding:"2px 6px", borderRadius:20 },
  todoInput: { display:"flex", gap:10, alignItems:"center", background:"#161616", border:"1px solid #222", borderRadius:12, padding:"8px 8px 8px 14px" },
  todoInputField: { flex:1, background:"transparent", border:"none", fontSize:14, color:"#f0f0f0", fontFamily:"'Instrument Sans',sans-serif" },
  todoCard:  { background:"#161616", border:"1px solid #1e1e1e", borderRadius:12, padding:"12px", display:"flex", alignItems:"center", gap:12 },
  todoText:  { flex:1, fontSize:14, color:"#d0d0d0", lineHeight:1.4 },
  todoSep:   { fontSize:11, color:"#3a3a3a", letterSpacing:"0.08em", textTransform:"uppercase", paddingTop:8 },
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(4px)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" },
  modalBox:  { background:"#161616", border:"1px solid #2a2a2a", borderRadius:"20px 20px 0 0", padding:"28px 22px 44px", width:"100%", maxWidth:480 },
  modalTitle:{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#f0f0f0", marginBottom:16 },
  modalInput:{ width:"100%", background:"#1e1e1e", border:"1px solid #333", borderRadius:10, padding:"12px 14px", fontSize:15, color:"#f0f0f0", fontFamily:"'Instrument Sans',sans-serif", marginBottom:20 },
  modalBtns: { display:"flex", gap:10 },
  modalCancel:{ flex:1, padding:"12px", borderRadius:10, background:"#1e1e1e", color:"#888", fontSize:14, fontFamily:"'Instrument Sans',sans-serif", fontWeight:500 },
  modalConfirm:{ flex:1, padding:"12px", borderRadius:10, background:"#f0f0f0", color:"#0f0f0f", fontSize:14, fontFamily:"'Instrument Sans',sans-serif", fontWeight:600 },
};
