export function validateRouting(routing: string): boolean {
  if (routing.length !== 9) return false
  // ABA checksum: http://en.wikipedia.org/wiki/Routing_transit_number
  const d = routing.split("").map(Number)
  if (d.some(isNaN)) return false
  const total =
    7 * (d[0]! + d[3]! + d[6]!) +
    3 * (d[1]! + d[4]! + d[7]!) +
    9 * (d[2]! + d[5]! + d[8]!)
  return total % 10 === 0
}
