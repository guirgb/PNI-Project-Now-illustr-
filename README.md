# Nova illust

Editor vetorial Android em Kotlin e Jetpack Compose, com armazenamento local, Firebase Auth/Firestore e recursos opcionais de Firebase AI Logic.

## Segurança

Este repositório público não inclui `google-services.json`, tokens App Check, chaves privadas, keystores, APKs, arquivos `.env` ou diretórios de build. Não coloque esses arquivos no GitHub.

## Configuração rápida

1. Clone o repositório e abra a pasta no Android Studio.
2. No Firebase Console, crie ou selecione um projeto e registre um app Android com o pacote `com.aistudio.nova.vxkrmq2`.
3. Baixe o `google-services.json` do seu próprio projeto e coloque-o em `app/google-services.json`.
4. Se o App Check em release usar reCAPTCHA, copie `app/src/main/res/values/firebase_applet_config.xml.example` para `app/src/main/res/values/firebase_applet_config.xml` e substitua `YOUR_RECAPTCHA_SITE_KEY` pela chave do seu projeto.
5. Ative Google Sign-In no Firebase Authentication, crie o banco Firestore e publique suas próprias regras usando `firestore.rules` como ponto de partida.
6. Para os recursos de IA, abra Firebase Console > AI Logic, escolha um provedor Gemini e configure o App Check. O token Debug é somente para desenvolvimento e não deve ser usado em uma versão distribuída.
7. Sincronize o Gradle e execute a variante `debug` no Android Studio.

## Build pelo terminal

Com Android SDK e Java configurados:

```bash
gradle :app:assembleDebug
```

O APK será gerado em `app/build/outputs/apk/debug/app-debug.apk`.

## Firebase e regras

As regras em `firestore.rules` são uma base restritiva. Revise-as para o seu modelo de dados e publique-as no projeto correto. Nunca publique credenciais administrativas ou uma service account.

## Licença

Adicione aqui a licença que você deseja usar antes de tornar o projeto público.
