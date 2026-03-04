export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center mt-20 ">
      <p className="text-2xl">
        Olá! Este é o<span className="text-[#006D7A]"> MediaVault</span>
      </p>

      <p className="text-[#444746] mt-4">
        O MediaVault é um sistema de gerenciamento de arquivos que permite aos
        usuários armazenar, organizar e acessar seus arquivos de forma
        eficiente.
      </p>
      <p className="text-[#444746] mt-4">
        Comece a usar o MediaVault adicionando seus arquivos na barra lateral
        esquerda clicando em "Novo".
      </p>
      <p className="text-[#444746] mt-4">
        Esse é um projeto pessoal, evite compartilhar{" "}
        <strong>informações sensíveis ou arquivos importantes</strong>.
      </p>
      <p className="text-[#444746] mt-4">
        O código-fonte do MediaVault está disponível no GitHub, então sinta-se à
        vontade para explorar, contribuir ou simplesmente dar uma olhada!
      </p>
      <p className="mt-30">
        Criado por{" "}
        <a
          href="https://github.com/joaovfarias"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-[#006D7A] underline">joaovfarias</span>
        </a>
      </p>
    </div>
  );
}
