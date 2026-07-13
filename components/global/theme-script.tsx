import type { ThemePreference } from "@/theme/theme.types";

const DEFAULT_STORAGE_KEY = "najibzadeh-theme";

type ThemeScriptProps = {
  defaultTheme?: ThemePreference;
  storageKey?: string;
};

export function ThemeScript({
  defaultTheme = "light",
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeScriptProps): React.JSX.Element {
  const script = `
(function(){
  var k=${JSON.stringify(storageKey)};
  var df=${JSON.stringify(defaultTheme)};
  var d=document.documentElement;
  var t;
  try{t=localStorage.getItem(k);}catch(e){}
  if(t!=="light"&&t!=="dark"){t=df;}
  if(t==="dark"){d.classList.add("dark");}else{d.classList.remove("dark");}
  d.setAttribute("data-theme",t);
  d.style.colorScheme=t;
})();
`
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return (
    <script
      id="najibzadeh-theme-script"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
