// Inlined in <head> by app/layout.tsx, so it runs before first paint: applies the stored theme (no flash), sets the
// js-ready flag the load entrances key off, and starts the hero entrance two frames after the document is parsed.
// Without JS none of this runs and every section is simply visible.
export const themeScript = `try{var r=document.documentElement,t=localStorage.getItem("theme");if(t)r.dataset.theme=t;r.classList.add("js-ready");document.addEventListener("DOMContentLoaded",function(){requestAnimationFrame(function(){requestAnimationFrame(function(){var h=document.querySelector(".hero");if(h)h.classList.add("in")})})})}catch(e){}`;
