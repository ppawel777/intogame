import { Image, ImageProps } from 'antd'
import s from './PlaceImage.module.scss'

type PlaceImageProps = ImageProps & {
   fixedHeight?: boolean
}

export const PlaceImage = ({ fixedHeight = true, className, ...props }: PlaceImageProps) => {
   const classes = [s.placeImage]
   if (fixedHeight) {
      classes.push(s.placeImageFixed)
   }
   if (className) {
      classes.push(className)
   }

   return <Image {...props} className={classes.join(' ')} />
}

PlaceImage.PreviewGroup = Image.PreviewGroup
