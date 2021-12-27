import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/Inter-Regular.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Regular.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/Inter-Medium.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Medium.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/Inter-SemiBold.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-SemiBold.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/Inter-Bold.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Bold.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 800;
  font-display: swap;
  src: url("/fonts/Inter-ExtraBold.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-ExtraBold.woff?v=3.18") format("woff");
}

  html,
  body {
  padding: 0;
  margin: 0;
  position: relative;
  height: 100%;
  font-size: 16px;
  letter-spacing: -0.011em;
  background-color: #f9fafb;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv02","cv03","cv04","cv09", "cv11";
}

html, body, button, input, select, textarea {
  font-family: 'Inter',-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

#__next {
  height: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
  outline-color: #4F46E5;
}

.sr-only {
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0;
  border: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;
}

label {
  margin: 0 0 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6e788c;
}

input, select, textarea {
  appearance: none;
  background-color: #fff;
  border: 1px solid #dddde2;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
}

input:not([type="checkbox"], [type="radio"]), textarea {
  padding: 0.6875rem 0.75rem;

  &:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #4F46E5;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px, #4F46E5 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }
}

input[type="checkbox"]:checked, input[type='radio']:checked {
  border-color: transparent;
  background-color: currentColor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

input[type='checkbox']:focus-visible, input[type='radio']:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
}

input[type='checkbox'] {
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: inline-block;
  vertical-align: middle;
  user-select: none;
  flex-shrink: 0;
  border-radius: 0.25rem;
  color: rgb(79, 70, 229);
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}

input[type="radio"] {
  margin: 0%;
  height: 1rem;
  width: 1rem;
  border-radius: 100%;
  flex-shrink: 0;
  color: rgb(79,70,229);
}

input[type="radio"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
}

select {
  padding: 0.6875rem 2.5rem 0.75rem 0.75rem;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239fa6b2' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-size: 1.375em 1.375em;
  background-repeat: no-repeat;
  color-adjust: exact;
  border: 1px solid #dddde2;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #36383e;
  cursor: pointer;
}

select:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(65, 141, 203, 0.2);
  border-color: #8faef4;
}

textarea {
  resize: vertical;
  min-height: 6rem;
  line-height: 1.5;
}

@media (max-width: 500px) {
  input, select, textarea {
    font-size: 1rem;
  }
}

@media print {
  @page:first {
    margin-top: 0;
    margin-bottom: 0;
  }

  @page {
    margin-top: 40px;
    margin-bottom: 0;
  }

  body, html {
    background-color: transparent;
  }

  body {
    padding: 48px 32px;
  }

  header, footer {
    display: none;
  }
}
`;

export default GlobalStyles;
