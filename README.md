# Reactorium

실제 화학(ΔG, 상평형, 전기화학, 핵융합)으로 움직이는 원소 합치기 게임.

| 파일 | 용도 |
|---|---|
| `index.html` | PC용 (브라우저에서 바로 열기) |
| `mobile/mobile.css`, `mobile/mobile.js` | 휴대폰 배치: 하단 모드 탭, 보드 + 패널 탭(목표·시약장·온도/압력·기록) |
| `scripts/build.py` | `index.html` + `mobile/*` → `www/index.html` (앱용) |
| `assets/` | 앱 아이콘·스플래시 원본 |
| `.github/workflows/android.yml` | Capacitor로 APK 빌드 |

## APK 받기
- `main`에 푸시하면 Actions가 빌드 → 실행 결과의 **Artifacts › Reactorium-apk**.
- `v*` 태그를 푸시하면 **Releases**에 `Reactorium.apk`가 올라감.

디버그 서명 APK라 휴대폰에서 "알 수 없는 앱 설치"를 허용하면 설치됩니다.

## 로컬 빌드
```bash
npm ci
python3 scripts/build.py
npx cap add android && npx cap sync android
cd android && ./gradlew assembleDebug
```
