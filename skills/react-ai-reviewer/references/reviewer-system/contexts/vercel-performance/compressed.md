# Vercel 성능 압축 컨텍스트

- 독립적인 async 작업을 순차로 await하면 waterfall이 생겨 첫 화면이 늦어진다.
- server에서 가능한 fetch를 client Effect로 미루면 hydration 이후까지 빈 화면이 길어질 수 있다.
- 넓은 client boundary와 무거운 초기 번들은 상호작용이 적은 화면에서도 비용을 만든다.
- memoization은 correctness 도구가 아니다. 성능 병목이 분명할 때만 의미가 있다.
- 중복 fetch, 넓은 re-render 전파, route/page 하단에서의 늦은 fetch는 우선 점검 대상이다.
