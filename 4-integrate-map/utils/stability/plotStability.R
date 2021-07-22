## asses class stability by collection 
## dhemerson.costa@ipam.org.br

## load libraries
library(ggplot2)
library(reshape2)

## avoid scientific notation
options(scipen= 999)

## define function to read table
readStability <- function (file) {
  ## read table
  x <- read.csv (file)[-1][-39]
  ## melt table
  x <- melt(x, id.vars=c('col', 'mapb', 'ref'))
  ## remove wetlands from previous collections
  all <- na.omit(subset (x, ref != 11))
  ## aggregate result for all classes
  all <- aggregate(x= list(count= all$value), 
                   by= list(freq= all$variable, col= all$col, ref= all$ref), FUN= 'sum')
  
  ## select only wetlands from col 6
  wet <- na.omit(subset (x, ref == 11 & col == '6_0'))
  ## aggregate results
  wet <- aggregate(x= list(count= wet$value), 
                   by= list(freq= wet$variable, col= wet$col, ref= wet$ref), FUN= 'sum')
  ## build dataframe
  x <- rbind (all, wet)
  
  x$freq <- gsub("X", "", x$freq)
  
  return (x)
}

## define function to rename classes
int_to_str <- function (reclass) {
  return(gsub("^3$", "03- Forest Formation",
              gsub("^4$", "04- Savanna Formation",
                   gsub("^11$", "11- Wetland",
                        gsub("^12", "12- Grassland Formation",
                             reclass)))))
}

## function to compute percentages
compPercent <- function (obj) {
    ## compute percent
  colec <- unique(obj$col)
  class <- unique(obj$ref)
  
  ## define empty recipe
  recipe <- as.data.frame(NULL)
  
  ## for each collection
  for (i in 1:length(colec)) {
    ## subset for the collection i
    temp <- subset(obj, col == colec[i])
    print (unique(temp$col))
    ## for each class
    for (j in 1:length(class)) {
      ## subset for the class j
      eachClass <- subset(temp, ref == class[j])
      print(unique(eachClass$ref))
      ## compute percent
      eachClass$Percent <- eachClass$count / sum(eachClass$count) * 100
      ## store
      recipe <- rbind(recipe, eachClass)
    }
  }
  
  return(recipe)
}

## read table
data <- readStability(file = '../tables/stability/freq_cols.csv')

## Rename references
data$ref <- int_to_str(reclass= data$ref)

## Compute percentages
data <- compPercent(obj= data)

## plot
ggplot (data, aes (x=as.numeric(freq), y= as.numeric(Percent), colour= col, linetype=col)) +
  geom_line(size=1) +
  scale_y_log10() + 
  scale_colour_manual("Collection", labels=c("3.1", "4.1", "5.0", "6.0"), values=c('gray50', 'gray30', 'red', 'forestgreen')) +
  scale_linetype_manual("Collection", labels=c("3.1", "4.1", "5.0", "6.0"), values=c("dotted", "dotdash", "twodash", "solid")) +
  facet_wrap(~ref, scales= 'free_y') +
  theme_bw() +
  xlab('Frequency') + ylab('Percent')
