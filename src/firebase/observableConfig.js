import { from } from 'rxjs'
import { setObservableConfig } from 'recompose'
const config = {
  fromESObservable: from,
}
setObservableConfig(config)
