In the server, set up some things ad-hoc

Impusle command block at spawn:

```
/tellraw @a[distance=..64] "flag{Excuse-Reserve-Captain-Glove}"
```

Repeating always on command blocks:

```
/execute as @e[type=item,nbt={Item:{id:"minecraft:dragon_egg"}}] run data modify entity @s Item.components.minecraft:custom_name set value "flag{Unsaved-Neutron-Dipper-Plot}"
/execute as @e[type=item,nbt={Item:{id:"minecraft:nether_star"}}] run data modify entity @s Item.components.minecraft:custom_name set value "flag{Clang-Bless-Eleven-Diffused}"
/tellraw @a[x=1272.1323423424234,y=70,z=-474.223423423434,distance=0] "flag{Mushroom-Bro-Passkey-3}"
```

Update seed challenge
