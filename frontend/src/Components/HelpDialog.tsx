import type { Dispatch } from "react";

export default function HelpDialog({
  setIsHelpOpen,
}: {
  setIsHelpOpen: Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setIsHelpOpen(false)}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informações do MediaVault
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Tipos de arquivo suportados
            </p>
            <p className="text-sm text-gray-800 mt-1">
              PDF, TXT, JPEG, PNG, MP4
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Tamanho máximo por arquivo
            </p>
            <p className="text-sm text-gray-800 mt-1">100 MB</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Número máximo de arquivos
            </p>
            <p className="text-sm text-gray-800 mt-1">200 arquivos</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Armazenamento total máximo
            </p>
            <p className="text-sm text-gray-800 mt-1">5 GB</p>
          </div>
        </div>
        <button
          onClick={() => setIsHelpOpen(false)}
          className="mt-5 w-full py-2 bg-[#006D7A] text-white rounded-lg hover:bg-[#004d57] text-sm"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
