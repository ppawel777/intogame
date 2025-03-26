import { eventsAPI } from '@api/eventsAPI'
import { faultdbAPI } from '@api/faultdbServerAPI'
import { inventorySchemaAPI } from '@api/inventorySchema'
import { inventoryAPI } from '@api/inventoryServerAPI'
import { restImageAPI } from '@api/restImageAPI'

export const apiObj = {
   inventoryAPI,
   inventorySchemaAPI,
   faultdbAPI,
   restImageAPI,
   eventsAPI,
}

export type ApiObj = typeof apiObj
