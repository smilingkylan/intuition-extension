import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const debounce = (mainFunction: Function, delay: number = 1000) => {
  // Declare a variable called 'timer' to store the timer ID
  let timer

  // Return an anonymous function that takes in any number of arguments
  return function (...args) {
    // Clear the previous timer to prevent the execution of 'mainFunction'
    clearTimeout(timer)

    // Set a new timer that will execute 'mainFunction' after the specified delay
    timer = setTimeout(() => {
      mainFunction(...args)
    }, delay)
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const strengthenImageUrl = (url: string = '') => {
  let finalSrc = url
  if (url.startsWith('ipfs://') || url.startsWith('https://')) {
    finalSrc = url
  } else {
    try {
      const _url = new URL(url)
    } catch (err) {
      if (url.startsWith('Qm') || url.startsWith('baf')) {
        finalSrc = 'https://ipfs.io/ipfs/' + url
      }
    }
  }
  return finalSrc
}