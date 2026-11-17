# NOVA --- Editor Vetorial para Android

O **NOVA** é um editor gráfico vetorial de código aberto, desenvolvido
para Android e otimizado para uso em modo paisagem. Sua interface adota
uma organização inspirada em editores desktop, com ferramentas de
desenho, pranchetas, camadas e painéis de propriedades.

O projeto busca oferecer um fluxo de trabalho familiar para quem utiliza
ferramentas como Adobe Illustrator e Inkscape, adaptado à interação em
dispositivos móveis.

> **Status do projeto:** este README descreve a arquitetura e os
> recursos previstos ou implementados conforme a documentação atual do
> projeto. A disponibilidade de cada recurso depende da versão do código
> publicada no repositório.

## Índice

-   [Recursos](#recursos)
-   [Tecnologias](#tecnologias)
-   [Requisitos](#requisitos)
-   [Configuração do ambiente](#configuração-do-ambiente)
-   [Compilação](#compilação)
-   [Testes](#testes)
-   [Estrutura do projeto](#estrutura-do-projeto)
-   [Configuração do Firebase](#configuração-do-firebase)
-   [Licença](#licença)

## Recursos

### Interface de edição

-   **Tela inicial:** acesso a documentos em branco, modelos e projetos
    recentes.
-   **Criação de documentos:** predefinições como A4, Carta, Web HD,
    1080 × 1080 e 800 × 600, com dimensões, orientação e unidades
    configuráveis (`px`, `mm`, `cm` e `pt`).
-   **Área de trabalho:** suporte a múltiplas pranchetas, réguas, grade
    configurável, guias manuais e encaixe inteligente (*Smart Snap*).
-   **Barra de ferramentas:** seleção, seleção direta, caneta, lápis,
    pincel, retângulo, elipse, polígono, estrela, texto, conta-gotas,
    mão e zoom.
-   **Painéis laterais:** propriedades, camadas, aparência, cores,
    traçado, transformação, alinhamento e ferramentas de IA.
-   **Atalhos:** suporte a teclado físico para ações como desfazer e
    refazer.

### Ferramentas vetoriais

-   Criação e edição de retângulos, elipses, polígonos, estrelas e
    caminhos Bézier.
-   Edição de caminhos por nós e desenho livre com suavização.
-   Textos editáveis e agrupamento hierárquico de objetos.
-   Operações booleanas (*Pathfinder*): união, subtração, interseção e
    exclusão.
-   Preenchimentos com cores sólidas, gradientes lineares e radiais.
-   Preenchimento de formas com imagens, com opções de ajuste e
    preenchimento.

### Arquivos e formatos

-   **Formato nativo `.nova`:** armazenamento em JSON de documentos,
    camadas, pranchetas, guias, estilos, gradientes, imagens e caminhos.
-   **Importação:** arquivos `.nova` e `.svg` por meio do seletor de
    arquivos do Android (SAF).
-   **Exportação:** arquivos `.nova`, `.svg` e `.png`, com opções de
    escala para PNG.
-   **SVG:** suporte a elementos como gradientes, grupos e
    preenchimentos com imagens.
-   **Histórico:** desfazer (`Ctrl + Z`) e refazer (`Ctrl + Shift + Z`
    ou `Ctrl + Y`).

### Conta, nuvem e comunidade

-   Autenticação com conta Google por meio do Jetpack Credential Manager
    e Firebase Authentication.
-   Armazenamento local de documentos com Room.
-   Sincronização de projetos na nuvem por usuário.
-   Publicação de modelos editáveis na comunidade online, com
    possibilidade de abrir projetos para edição.
-   Regras de segurança do Cloud Firestore.

### Assistente de inteligência artificial

O painel de IA utiliza Firebase AI Logic e Firebase App Check. Os
recursos descritos para o assistente incluem:

-   **Geração vetorial:** criação de composições editáveis e organizadas
    em camadas a partir de descrições em português.
-   **Paletas e gradientes:** sugestão de combinações de cores.
-   **Organização:** sugestões de nomes semânticos para camadas e
    objetos.
-   **Tipografia:** sugestões e reformulação de textos.
-   **Análise visual:** avaliação de contraste, alinhamento e hierarquia
    da composição.
-   **Geração de texturas:** criação opcional de texturas para
    preenchimentos, sujeita aos requisitos de faturamento do Firebase.

## Tecnologias

  -----------------------------------------------------------------------
  Área                                Tecnologia
  ----------------------------------- -----------------------------------
  Linguagem                           Kotlin 2.2.10

  Interface                           Jetpack Compose e Material Design 3

  Arquitetura                         MVVM, StateFlow e Kotlin Coroutines

  Banco de dados local                Room

  Backend                             Firebase Authentication e Cloud
                                      Firestore

  Proteção de aplicações              Firebase App Check

  Inteligência artificial             Firebase AI Logic

  Imagens                             Coil Compose

  Serialização                        Moshi Kotlin

  Renderização vetorial               `android.graphics.Canvas` e `Path`

  Testes                              JUnit 4, Robolectric, Compose UI
                                      Test e Firebase Local Emulator
                                      Suite
  -----------------------------------------------------------------------

## Requisitos

Antes de compilar o projeto, tenha instalado:

-   Android Studio compatível com a versão do Android Gradle Plugin
    utilizada pelo projeto.
-   JDK compatível com o Gradle e o Android Gradle Plugin configurados.
-   Android SDK com `compileSdk 36`.
-   Um dispositivo ou emulador com Android 7.0 (API 24) ou superior,
    considerando o `minSdk 24`.
-   Projeto Firebase configurado, caso queira utilizar autenticação,
    sincronização, comunidade ou recursos de IA.

As versões efetivas das ferramentas devem ser conferidas nos arquivos de
configuração do Gradle do repositório.

## Configuração do ambiente

### 1. Clone o repositório

Substitua a URL de exemplo pela URL real do repositório:

``` bash
git clone https://github.com/SEU_USUARIO/nova-vector-editor.git
cd nova-vector-editor
```

### 2. Configure o Firebase

A configuração do Firebase é necessária para os recursos online, como
login, nuvem, comunidade e assistente de IA.

1.  Crie um projeto no [Firebase
    Console](https://console.firebase.google.com/).
2.  Registre um aplicativo Android usando o `applicationId` definido em
    `app/build.gradle.kts`.
3.  Baixe o arquivo `google-services.json` e coloque-o no diretório
    `app/`.
4.  Configure os provedores e serviços utilizados pelo projeto:
    -   Firebase Authentication com login Google;
    -   Cloud Firestore;
    -   Firebase App Check;
    -   Firebase AI Logic.
5.  Configure os provedores de App Check adequados ao ambiente de
    execução. Para desenvolvimento, utilize o provedor de depuração
    quando necessário.
6.  Adicione os hashes SHA-1 e SHA-256 do certificado de assinatura às
    configurações do aplicativo no Firebase, quando exigidos pelo fluxo
    de autenticação.

**Importante:** não publique chaves, arquivos de configuração privados
ou credenciais de serviços. Revise as regras do Firestore antes de
disponibilizar o aplicativo publicamente.

Se o Firebase CLI estiver instalado e autenticado, publique as regras
com:

``` bash
firebase deploy --only firestore:rules
```

## Compilação

Na raiz do projeto, execute:

``` bash
./gradlew assembleDebug
```

No Windows, utilize:

``` bat
gradlew.bat assembleDebug
```

Após a compilação, o APK de depuração será gerado em:

``` text
app/build/outputs/apk/debug/app-debug.apk
```

## Testes

Para executar os testes unitários:

``` bash
./gradlew :app:testDebugUnitTest
```

No Windows:

``` bat
gradlew.bat :app:testDebugUnitTest
```

Os testes das regras do Firestore que utilizam
`CommunityRepositoryRuleTest` exigem que os emuladores locais do
Firebase Authentication e do Cloud Firestore estejam em execução. De
acordo com a configuração documentada do projeto, eles utilizam as
portas `9099` e `8085`, respectivamente.

## Estrutura do projeto

A estrutura abaixo representa a organização de pacotes documentada para
o código-fonte:

``` text
app/src/main/java/com/example/
├── ai/                  # Integração com Firebase AI Logic e parser de composições
├── data/
│   ├── cloud/           # Repositórios Firestore e dados da comunidade
│   └── storage/         # Banco local Room e DAO dos documentos .nova
├── domain/              # Modelos vetoriais, geometria, nós Bézier e predefinições
├── engine/
│   ├── export/          # Formato .nova e importação/exportação SVG e PNG
│   ├── geometry/        # Operações booleanas (Pathfinder)
│   ├── history/         # Histórico de desfazer e refazer
│   └── rendering/       # Renderização vetorial e preenchimentos com imagem
├── firebase/            # App Check e autenticação Google
└── ui/
    ├── ai/              # ViewModel e painel do assistente de IA
    ├── cloud/           # Comunidade, nuvem e publicação de projetos
    ├── dialogs/         # Diálogos de documentos, pranchetas e exportação
    ├── editor/          # Editor, ferramentas, painéis e área de desenho
    ├── home/            # Tela inicial, modelos e arquivos
    └── theme/           # Tema visual do aplicativo
```

> O caminho `com/example/` deve ser ajustado se o `namespace` do
> aplicativo utilizar outro pacote.

## Licença

O projeto é apresentado como software de código aberto, mas a licença
precisa ser definida no repositório. Antes de publicar, escolha uma
licença, adicione o arquivo correspondente (`LICENSE`) à raiz do projeto
e atualize esta seção.

Algumas opções comuns são [MIT](https://opensource.org/license/mit/) e
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
