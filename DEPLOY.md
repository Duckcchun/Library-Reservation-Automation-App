# 배포 가이드

이 문서는 자양한강도서관 예약 도서 라벨 인쇄 시스템을 배포하는 가장 빠른 방법을 정리합니다.

## 1) GitHub Pages 자동 배포(권장)

이 저장소에는 이미 GitHub Actions 워크플로가 포함되어 있습니다.

- 워크플로 파일: `.github/workflows/deploy-pages.yml`
- 트리거: `main` 브랜치에 push
- 배포 결과: `https://<깃허브아이디>.github.io/<저장소이름>/`

### 설정 방법

1. 이 프로젝트를 GitHub 저장소로 push합니다.
2. GitHub 저장소에서 Settings > Pages로 이동합니다.
3. Source를 GitHub Actions로 선택합니다.
4. `main` 브랜치에 커밋을 push하면 자동 배포됩니다.
5. Actions 탭에서 `Deploy to GitHub Pages` 워크플로 완료를 확인합니다.

### 참고

- 이 프로젝트는 Vite `base` 경로를 `FIGMA_PUBLIC_URL` 환경 변수로 처리합니다.
- 워크플로에서 `/${{ github.event.repository.name }}` 값을 자동 주입하므로, 별도 코드 수정 없이 저장소 이름 경로로 정상 배포됩니다.

## 2) Figma Make 배포(현재 구조 유지)

이 프로젝트는 Figma Make 스크립트도 이미 포함하고 있습니다.

- `.figma/make/deploy`
- `.figma/make/deploy-preview`

### 실행 예시

- 정식 배포: `./.figma/make/deploy`
- 미리보기 배포: `./.figma/make/deploy-preview`

해당 스크립트는 내부적으로 빌드 후 `figma make deploy --build-dir dist`를 실행합니다.

## 운영 체크리스트

배포 후 아래 항목을 확인하세요.

1. 엑셀 업로드(.xlsx, .xls, .csv) 정상 동작
2. 예약자 열 자동 감지 및 가나다 정렬 확인
3. 검색/삭제/중복 뱃지 표시 동작 확인
4. 인쇄 미리보기 글자 크기 슬라이더 반영 확인
5. 브라우저 인쇄 창에서 여백 없음, 배경 그래픽 해제 설정 확인
