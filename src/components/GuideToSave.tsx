import { Dispatch, JSX, SetStateAction, useEffect, useRef } from 'react';
import './GuideToSave.css'
import { verifyAccountPermission } from '../utils/indexedDb';

interface GuideToSaveProps {
    isActive: boolean;
    setIsActive: Dispatch<SetStateAction<boolean>>;
    accountHandle: FileSystemFileHandle | null;
    handleSelectAccount(): Promise<void>;
}

function GuideToSave({ isActive, setIsActive, accountHandle, handleSelectAccount }: GuideToSaveProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!isActive) {
            container.style.display = "block";
            container.classList.remove("sleep");
        } else {
            const timer = setTimeout(() => {
                container.style.display = "none";
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [accountHandle, isActive]);

    async function handlePermissionToSave(allow: boolean) {
        if (!allow) {
            containerRef.current?.classList.add("sleep");
            return;
        }

        if (accountHandle) {
            try {
                const permission = await verifyAccountPermission(accountHandle);
                
                if (permission) {
                    setIsActive(true);
                } else {
                    alert("A permissão foi negada pelo navegador.");
                }
            } catch (error) {
                console.error("Erro na permissão:", error);
            }
        }
    }

    return (
        <div id="guide-to-save-progress" ref={containerRef}>
            {!accountHandle ? (
                <div className="alert-bar">
                    <span id="handle-span">
                        Save não detectado. informe o arquivo: <strong>account.save.json</strong>
                        <br />ou seu progresso não poderá ser mantido.
                    </span>
                    <button onClick={handleSelectAccount}>Selecionar arquivo</button>
                    <button id="laterBtn" onClick={() => containerRef.current?.classList.add("sleep")}>
                        Mais tarde
                    </button>
                </div>
            ) : !isActive ? (
                <div className="alert-bar">
                    <span id="permission-span">Permissão para acesso ao save não concedida</span>
                    <button id="allow-btn" onClick={() => handlePermissionToSave(true)}>Permitir</button>
                    <button id="forbid-btn" onClick={() => handlePermissionToSave(false)}>Não permitir</button>
                </div>
            ) : (
                <p className="runtime-active-msg">
                    🚀 Runtime conectado ao arquivo local.
                </p>
            )}
        </div>
    );
}

export default GuideToSave;