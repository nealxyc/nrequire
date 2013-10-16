
### Based on v0.01
* Normalize moduleId return from require.moduleIdResolver (Done)
* Maintain the stack of loading modules.
* Use the stack to resolve dependency loop. (a.js requires b.js, b.js requires a.js)
* Replace the current AJAX code with more reliable library (jQuery's ?). Would prefer to extract only jQuery's Ajax part if possible.




