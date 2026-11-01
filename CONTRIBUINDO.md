# Guia de Contribuição
Siga aqui as guidelines para contribuição no projeto

## Contribuindo com código
Como você pode contribuir com código para o projeto

### 1) Clone localmente
Abra o seu cmd na pasta local do projeto e digite o comando git clone seguido da URL do seu fork para clonar o seu repositório localmente. Por exemplo:

```bash
git clone https://github.com/USERNAME/NOME_DO_REPOSITORIO.git
```

```
npm install
```

### 2) Crie uma nova `branch`
Utilize o comando git checkout -b para criar e alternar para a nova branch e nomeie-a conforme a issue sendo resolvida
> Exemplo: `git checkout -b feat/controllers-user`

### 3.1) Crie um Commit
Crie um commit e adicione a mensagem indicando a issue resolvida:
> Exemplo: `git commit -m "create controllers-user"`


### 3.2) Tipos de nomenclaturas

```
Type      Purpose                                Example
--------  -------------------------------------- -------------------------------
feat      A new feature                          feat(auth): add JWT login
fix       A bug fix                              fix(api): handle null response safely
docs      Documentation only                     docs(readme): add API usage
style     Code style (formatting, etc.)           style(lint): fix eslint warnings
refactor  Refactoring without changing behavior   refactor(user): simplify login logic
perf      Performance improvement                 perf(cache): reduce DB lookups
test      Adding or fixing tests                  test(api): add order flow test
chore     Maintenance or tooling                  chore(deps): update express to v4.18.2
```
