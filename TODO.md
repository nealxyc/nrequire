
### Based on v0.01
* (Done) Normalize moduleId return from require.moduleIdResolver
* Maintain the stack of loading modules.
* Use the stack to resolve dependency loop. (a.js requires b.js, b.js requires a.js)
* (Done) Replace the current AJAX code with more reliable library (jQuery's ?). Would prefer to extract only jQuery's Ajax part if possible.
* Prefetch. Prefetch module scripts with async gets but no eval.




