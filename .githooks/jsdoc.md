# JSdoc
[JSdoc](http://usejsdoc.org/) is used to automatically generate documentation.

## git commit -> generate documentation
To automaticlly generate documentation when git commit is used
write in git command line:
```
git config core.hooksPath .githooks
```
Script that generate documentation is saved in .githooks/commit-msg. It usses [git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).
Add maps directory with code that you want in documentation in line 16, like `.\\data` and `.\\core`.

```
jsdoc .\\data .\\core -d ./docs
```