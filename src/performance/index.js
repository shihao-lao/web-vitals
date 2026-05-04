import observerPaint from './observerPaint.js'
import observerFCP from './observerFCP.js'
import observerLCP from './observerLCP.js'
import observerLoad from './observerLoad.js'
import observerEntries from './observerEntries.js'
import xhr from './xhr.js'

export default function performance() {
    observerPaint()
    observerFCP()
    observerLCP()
    observerLoad()
    observerEntries()
    xhr()
}