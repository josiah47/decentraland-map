// Code borrowed from https://github.com/decentraland/auction.git
var tinycolor2 = require('tinycolor2');

const COLORS = {
  littleValue: '#FFF189',
  bigValue: '#EF303B'
}

const genesis = '55327350-d9f0-4cae-b0f3-8745a0431099'
const roads = 'f77140f9-c7b4-4787-89c9-9fa0e219b079'
const minHSV = tinycolor2(COLORS.littleValue).toHsv()
const maxHSV = tinycolor2(COLORS.bigValue).toHsv()

const CLASS_NAMES = {
  won: 'won',
  winning: 'winning',
  lost: 'lost',
  outbid: 'outbid',
  taken: 'taken',
  genesis: 'genesis',
  district: 'district',
  roads: 'roads',
  default: 'default',
  pending: 'pending',
  loading: 'loading'
}

exports.capitalize = function (str) {
  if (typeof str !== 'string') return null
  if (!str.trim()) return str

  let firstLetter = str.charAt(0).toUpperCase()
  let rest = str.slice(1)

  return firstLetter + rest
}

exports.buildCoordinate = function (x, y) {
  return `${x},${y}`
}

exports.isPending = function (parcel, pendingConfirmationBids) {
  return (
    pendingConfirmationBids &&
    pendingConfirmationBids.filter(
      bid => bid.x === parcel.x && bid.y === parcel.y
    ).length > 0
  )
}

exports.getClassName = function (parcel, addressState, pendingConfirmationBids) {
  if (!parcel || parcel.error) return CLASS_NAMES.loading
  if (isReserved(parcel)) return getReservationClass(parcel)
  if (isPending(parcel, pendingConfirmationBids)) return CLASS_NAMES.pending
  if (!parcel.amount) return CLASS_NAMES.default

  let className = ''

  if (hasBidInParcel(addressState, parcel)) {
    const byAddress = parcel.address === addressState.address

    if (hasEnded(parcel)) {
      className = byAddress ? CLASS_NAMES.won : CLASS_NAMES.lost
    } else {
      className = byAddress ? CLASS_NAMES.winning : CLASS_NAMES.outbid
    }
  } else if (hasEnded(parcel)) {
    className = CLASS_NAMES.taken
  }

  return className
}

exports.hasBidInParcel = function (addressState, parcel) {
  const parcelCoordinate = buildCoordinate(parcel.x, parcel.y)
  const bidParcels = getBidParcels(addressState)

  return !!bidParcels[parcelCoordinate]
}

exports.getBidParcels = function (addressState) {
  const bidGroups = addressState.bidGroups || []
  const bidParcels = {}

  for (const bidGroup of bidGroups) {
    for (const bid of bidGroup.bids) {
      const coordinate = buildCoordinate(bid.x, bid.y)
      bidParcels[coordinate] = bid
    }
  }
  return bidParcels
}

exports.getBidStatus = function (parcel, addressState) {
  const className = getClassName(parcel, addressState)
  let status = ''

  switch (className) {
    case CLASS_NAMES.default:
    case CLASS_NAMES.loading:
      status = ''
      break
    case CLASS_NAMES.genesis:
      status = 'Plaza'
      break
    case CLASS_NAMES.roads:
      status = 'Road'
      break
    default:
      status = capitalize(className)
  }

  return status
}

exports.getColorByAmount = function (amount, maxAmount) {
  maxAmount = amount > maxAmount ? amount : maxAmount

  // toHsv() => { h: 0, s: 1, v: 1, a: 1 }
  const h = memorizedHue(amount, maxAmount)
  const s = memorizedSat(amount, maxAmount)

  return tinycolor2({ h: -h, s, v: 1, a: 1 }).toHexString()
}

exports.isReserved = function (parcel) {
  return !!parcel.projectId
}

exports.getReservationClass = function (parcel) {
  return parcel.projectId === genesis
    ? CLASS_NAMES.genesis
    : parcel.projectId === roads ? CLASS_NAMES.roads : CLASS_NAMES.district
}

exports.hasEnded = function (parcel) {
  return parcel.endsAt && Date.now() >= parcel.endsAt.getTime()
}

var savedMaxAmount = null
var savedHues = {}
var savedSats = {}

function memorizedHue(amount, maxAmount) {
  if (maxAmount === savedMaxAmount) {
    if (!savedHues[amount]) {
      savedHues[amount] = calculateColorValue(
        amount,
        maxAmount,
        -minHSV.h,
        maxHSV.h
      )
    }
    return savedHues[amount]
  } else {
    savedMaxAmount = maxAmount
    savedHues = {}
    savedSats = {}
    return memorizedHue(amount, maxAmount)
  }
}

function memorizedSat(amount, maxAmount) {
  if (maxAmount === savedMaxAmount) {
    if (!savedSats[amount]) {
      savedSats[amount] = calculateColorValue(
        amount,
        maxAmount,
        minHSV.s,
        maxHSV.s
      )
    }
    return savedSats[amount]
  } else {
    savedMaxAmount = maxAmount
    savedHues = {}
    savedSats = {}
    return memorizedSat(amount, maxAmount)
  }
}

function calculateColorValue(amount, maxAmount, minValue, maxValue) {
  const priceRate = amount - 1000
  return priceRate * (maxValue - minValue) / (maxAmount + minValue) + minValue
}
